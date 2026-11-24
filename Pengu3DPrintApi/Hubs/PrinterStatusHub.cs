using Microsoft.AspNetCore.SignalR;
using Pengu3DPrintApi.Data.DTO.Printer;
using Pengu3DPrintApi.Services;

namespace Pengu3DPrintApi.Hubs;

public sealed class PrinterStatusHub(PrinterConnectionManager connectionManager) : Hub
{
    public IReadOnlyCollection<PrinterStatusUpdate> GetCurrentStatuses()
    {
        return connectionManager.GetCurrentStatuses();
    }
}
