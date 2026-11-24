using System.Collections.Concurrent;
using BambuSharp;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Pengu3DPrintApi.Data;
using Pengu3DPrintApi.Data.DTO.Printer;
using Pengu3DPrintApi.Data.Enums;
using Pengu3DPrintApi.Hubs;

namespace Pengu3DPrintApi.Services;

public sealed class PrinterConnectionManager : BackgroundService
{
    private static readonly TimeSpan ReconciliationInterval = TimeSpan.FromSeconds(10);
    private static readonly TimeSpan ConnectionAttemptTimeout = TimeSpan.FromSeconds(20);
    private static readonly TimeSpan ReportTimeout = TimeSpan.FromSeconds(30);
    private static readonly TimeSpan RetryDelay = TimeSpan.FromSeconds(10);
    private static readonly TimeSpan ReportCheckInterval = TimeSpan.FromSeconds(1);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IHubContext<PrinterStatusHub> _hubContext;
    private readonly ILogger<PrinterConnectionManager> _logger;
    private readonly ConcurrentDictionary<Guid, ManagedPrinter> _connections = new();
    private readonly ConcurrentDictionary<Guid, PrinterStatusUpdate> _statuses = new();
    private long _statusVersion;

    public PrinterConnectionManager(
        IServiceScopeFactory scopeFactory,
        IHubContext<PrinterStatusHub> hubContext,
        ILogger<PrinterConnectionManager> logger)
    {
        _scopeFactory = scopeFactory;
        _hubContext = hubContext;
        _logger = logger;
    }

    public IReadOnlyCollection<PrinterStatusUpdate> GetCurrentStatuses()
    {
        return _statuses.Values.ToArray();
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ReconcileConnectionsAsync(stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception exception)
                {
                    _logger.LogError(
                        "Could not reconcile printer connections. Error type: {ErrorType}",
                        exception.GetType().Name);
                }

                await Task.Delay(ReconciliationInterval, stoppingToken);
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
        }
        finally
        {
            foreach (var connection in _connections.Values.ToArray())
            {
                await StopConnectionAsync(connection);
            }
        }
    }

    private async Task ReconcileConnectionsAsync(CancellationToken cancellationToken)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<PenguMonitorDbContext>();
        var printers = await dbContext.Printers
            .AsNoTracking()
            .Select(printer => new
            {
                printer.Id,
                printer.IP,
                printer.AccessCode,
                printer.SerialNumber,
                printer.PrinterType,
            })
            .ToListAsync(cancellationToken);

        var desiredConnections = printers.ToDictionary(
            printer => printer.Id,
            printer => new PrinterConfiguration(
                printer.Id,
                printer.IP.ToString(),
                printer.AccessCode,
                printer.SerialNumber,
                printer.PrinterType));

        foreach (var current in _connections.Values.ToArray())
        {
            var isStillConfigured = desiredConnections.TryGetValue(current.Configuration.Id, out var desired);
            if (!isStillConfigured || current.Configuration != desired)
            {
                await StopConnectionAsync(current);

                if (!isStillConfigured)
                {
                    _statuses.TryRemove(current.Configuration.Id, out _);
                    try
                    {
                        await _hubContext.Clients.All.SendAsync(
                            "PrinterRemoved",
                            current.Configuration.Id,
                            cancellationToken);
                    }
                    catch (Exception exception)
                    {
                        _logger.LogWarning(
                            "Could not broadcast removal for printer {PrinterId}. Error type: {ErrorType}",
                            current.Configuration.Id,
                            exception.GetType().Name);
                    }
                }
            }
        }

        foreach (var configuration in desiredConnections.Values)
        {
            if (_connections.ContainsKey(configuration.Id))
            {
                continue;
            }

            var connection = new ManagedPrinter(configuration);
            if (_connections.TryAdd(configuration.Id, connection))
            {
                SetStatus(configuration.Id, "Connecting");
                connection.MonitorTask = MonitorPrinterAsync(connection, cancellationToken);
            }
        }
    }

    private async Task MonitorPrinterAsync(
        ManagedPrinter connection,
        CancellationToken serviceCancellationToken)
    {
        using var lifetime = CancellationTokenSource.CreateLinkedTokenSource(serviceCancellationToken);
        connection.Lifetime = lifetime;
        var missingSerialNumberLogged = false;

        while (!lifetime.IsCancellationRequested)
        {
            if (string.IsNullOrWhiteSpace(connection.Configuration.SerialNumber))
            {
                if (!missingSerialNumberLogged)
                {
                    _logger.LogWarning(
                        "Printer {PrinterId} has no serial number configured. Add the Bambu Lab serial number to enable MQTT monitoring.",
                        connection.Configuration.Id);
                    missingSerialNumberLogged = true;
                }

                SetStatus(connection.Configuration.Id, "Offline");
                await Task.Delay(ReconciliationInterval, lifetime.Token);
                continue;
            }

            missingSerialNumberLogged = false;
            LocalPrinter? printer = null;
            long lastReportUtcTicks = 0;
            EventHandler reportHandler = (_, _) =>
            {
                Interlocked.Exchange(ref lastReportUtcTicks, DateTimeOffset.UtcNow.UtcTicks);
                SetStatus(connection.Configuration.Id, "Online");
            };

            try
            {
                printer = new LocalPrinter(
                    connection.Configuration.Ip,
                    connection.Configuration.AccessCode,
                    connection.Configuration.SerialNumber);
                printer.ReportReceived += reportHandler;
                SetStatus(connection.Configuration.Id, "Connecting");
                using (var attemptTimeout =
                    CancellationTokenSource.CreateLinkedTokenSource(lifetime.Token))
                {
                    attemptTimeout.CancelAfter(ConnectionAttemptTimeout);
                    await printer.Connect(attemptTimeout.Token);
                }

                Interlocked.Exchange(ref lastReportUtcTicks, DateTimeOffset.UtcNow.UtcTicks);
                SetStatus(connection.Configuration.Id, "Online");

                while (!lifetime.IsCancellationRequested)
                {
                    await Task.Delay(ReportCheckInterval, lifetime.Token);

                    var lastReportTicks = Interlocked.Read(ref lastReportUtcTicks);
                    var lastReport = new DateTimeOffset(lastReportTicks, TimeSpan.Zero);
                    if (DateTimeOffset.UtcNow - lastReport > ReportTimeout)
                    {
                        throw new TimeoutException("Printer report became stale.");
                    }
                }
            }
            catch (OperationCanceledException) when (lifetime.IsCancellationRequested)
            {
                break;
            }
            catch (Exception exception)
            {
                var errorMessage = exception.Message;
                if (!string.IsNullOrEmpty(connection.Configuration.AccessCode))
                {
                    errorMessage = errorMessage.Replace(
                        connection.Configuration.AccessCode,
                        "[redacted]",
                        StringComparison.Ordinal);
                }

                if (!string.IsNullOrWhiteSpace(connection.Configuration.SerialNumber))
                {
                    errorMessage = errorMessage.Replace(
                        connection.Configuration.SerialNumber,
                        "[redacted]",
                        StringComparison.OrdinalIgnoreCase);
                }

                _logger.LogWarning(
                    "Printer connection failed for {PrinterId} at {PrinterIp}. Error type: {ErrorType}. Details: {ErrorMessage}. Retrying in {RetrySeconds} seconds.",
                    connection.Configuration.Id,
                    connection.Configuration.Ip,
                    exception.GetType().Name,
                    errorMessage,
                    RetryDelay.TotalSeconds);
                SetStatus(connection.Configuration.Id, "Offline");
            }
            finally
            {
                if (printer is not null)
                {
                    printer.ReportReceived -= reportHandler;
                    try
                    {
                        await printer.Disconnect();
                    }
                    catch (Exception exception)
                    {
                        _logger.LogWarning(
                            "Could not disconnect printer {PrinterId}. Error type: {ErrorType}",
                            connection.Configuration.Id,
                            exception.GetType().Name);
                    }

                    try
                    {
                        printer.Dispose();
                    }
                    catch (Exception exception)
                    {
                        _logger.LogWarning(
                            "Could not dispose the connection for printer {PrinterId}. Error type: {ErrorType}",
                            connection.Configuration.Id,
                            exception.GetType().Name);
                    }
                }
            }

            if (!lifetime.IsCancellationRequested)
            {
                await Task.Delay(RetryDelay, lifetime.Token);
            }
        }

        SetStatus(connection.Configuration.Id, "Offline");
    }

    private void SetStatus(Guid printerId, string status)
    {
        while (true)
        {
            if (_statuses.TryGetValue(printerId, out var current))
            {
                if (current.Status == status)
                {
                    return;
                }

                var update = new PrinterStatusUpdate(
                    printerId,
                    status,
                    Interlocked.Increment(ref _statusVersion));
                if (!_statuses.TryUpdate(printerId, update, current))
                {
                    continue;
                }

                _ = BroadcastStatusAsync(update);
                return;
            }

            var initialUpdate = new PrinterStatusUpdate(
                printerId,
                status,
                Interlocked.Increment(ref _statusVersion));
            if (!_statuses.TryAdd(printerId, initialUpdate))
            {
                continue;
            }

            _ = BroadcastStatusAsync(initialUpdate);
            return;
        }
    }

    private async Task BroadcastStatusAsync(PrinterStatusUpdate update)
    {
        try
        {
            await _hubContext.Clients.All.SendAsync("PrinterStatusChanged", update);
        }
        catch (Exception exception)
        {
            _logger.LogWarning(
                "Could not broadcast status for printer {PrinterId}. Error type: {ErrorType}",
                update.Id,
                exception.GetType().Name);
        }
    }

    private async Task StopConnectionAsync(ManagedPrinter connection)
    {
        if (!_connections.TryRemove(connection.Configuration.Id, out var removed))
        {
            return;
        }

        removed.Lifetime?.Cancel();
        if (removed.MonitorTask is not null)
        {
            try
            {
                await removed.MonitorTask;
            }
            catch (OperationCanceledException)
            {
            }
        }

        removed.Lifetime?.Dispose();
    }

    private sealed class ManagedPrinter(PrinterConfiguration configuration)
    {
        public PrinterConfiguration Configuration { get; } = configuration;
        public CancellationTokenSource? Lifetime { get; set; }
        public Task? MonitorTask { get; set; }
    }

    private sealed record PrinterConfiguration(
        Guid Id,
        string Ip,
        string AccessCode,
        string SerialNumber,
        EPrinterType PrinterType);
}
