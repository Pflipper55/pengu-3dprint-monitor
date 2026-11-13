using System.Data;
using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pengu3DPrintApi.Data;
using Pengu3DPrintApi.Data.DTO.Bed;
using Pengu3DPrintApi.Data.DTO.Filament;
using Pengu3DPrintApi.Data.DTO.Nozzle;
using Pengu3DPrintApi.Data.DTO.Printer;
using Pengu3DPrintApi.Services.Factories;

namespace Pengu3DPrintApi.Controllers;

[ApiController]
[Route("[controller]")]
public class PrinterController : ControllerBase
{
    private readonly PenguMonitorDbContext _context;
    private readonly ILogger<PrinterController> _logger;

    public PrinterController(PenguMonitorDbContext context, ILogger<PrinterController> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpGet("all", Name = "GetPrinters")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NoContent)]
    public ActionResult<IEnumerable<PrinterOverviewModel>> GetAllPrinters()
    {
        // Add Auth when needed
        this._logger.LogInformation("PrinterController - Getting all printers");
        var result = _context.Printers.Select((printer) => new PrinterOverviewModel()
        {
            Id = printer.Id,
            Name = printer.Name,
            Ip = printer.IP.ToString(),
            FirmwareVersion = printer.FirmwareVersion,
            PrinterType = printer.PrinterType,
        }).ToList();

        if(!result.Any())
        {
            this._logger.LogInformation("PrinterController - no printers added!");
            return this.NoContent();
        }

        return this.Ok(result);
    }

    [HttpGet("{id}", Name = "GetPrinter")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public ActionResult<PrinterDetailsModel> GetById(Guid id)
    {
        // Add Auth when needed
        this._logger.LogInformation("PrinterController - Getting printer with id: {id}", id);
        var printer = _context.Printers
            .Include(printer => printer.Nozzles)
            .Include(printer => printer.LoadedFilaments)
            .Include(printer => printer.UsedBed)
            .SingleOrDefault(printer => printer.Id == id);

        if(printer is null)
        {
            this._logger.LogInformation("PrinterController - no printer with id: {id}!", id);
            return this.NotFound();
        }

        var result = new PrinterDetailsModel
        {
            Id = printer.Id,
            Name = printer.Name,
            PrinterType = printer.PrinterType,
            Ip = printer.IP.ToString(),
            AccessCode = printer.AccessCode,
            PrintingHours = printer.PrintingHours,
            FirmwareVersion = printer.FirmwareVersion,
            Nozzles = printer.Nozzles.Select(nozzle => new NozzleOverviewModel
            {
                Id = nozzle.Id,
                IsHardened = nozzle.IsHardened,
                NozzleType = nozzle.NozzleType,
                PrinterId = nozzle.PrinterId
            }).ToList(),
            LoadedFilaments = printer.LoadedFilaments.Select(filament => new FilamentOverviewModel
            {
                Id = filament.Id,
                BrandName = filament.BrandName,
                FilamentType = filament.FilamentType,
                Weight = filament.Weight,
                ColorCode = filament.ColorCode,
                PrinterId = filament.PrinterId
            }).ToList(),
            UsedBed = printer.UsedBed is null ? null : new BedOverviewModel
            {
                Id = printer.UsedBed.Id,
                BrandName = printer.UsedBed.BrandName,
                BedType = printer.UsedBed.BedType,
                PrinterId = printer.UsedBed.PrinterId
            }
        };

        return this.Ok(result);
    }

    [HttpPost("create", Name = "CreatePrinter")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.Conflict)]
    public async Task<ActionResult> Create(CreatePrinterRequest request)
    {
        // Add Auth when needed
        this._logger.LogInformation("PrinterController - Creating printer with name: {name}", request.Name);
        var result = _context.Printers.Where((printer) => string.Compare(request.Name, printer.Name) == 0 
            || printer.IP.Equals(request.Ip)) 
            .Select((printer) => new PrinterOverviewModel()
        {
            Id = printer.Id,
            Name = printer.Name,
            Ip = printer.IP.ToString(),
            FirmwareVersion = printer.FirmwareVersion,
            PrinterType = printer.PrinterType,
        }).ToList();

        if(result.Any())
        {
            this._logger.LogError("PrinterController - there is already a printer with the name {name} or ip {ip}!", request.Name, request.Ip);
            return this.Conflict();
        }

        var entity = PrinterFactory.Create(request);

        try
        {
            _context.Printers.Add(entity);
            await _context.SaveChangesAsync();

            this._logger.LogInformation("PrinterController - Printer successfully added.");
            return this.Ok();
        }
        catch(Exception ex) {
            this._logger.LogError("PrinterController - Error during creation of printer. Exception message: {message}", ex.Message);
            return this.Problem(ex.Message);
        }
    }

    [HttpPost("update", Name = "UpdatePrinter")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    [ProducesResponseType((int)HttpStatusCode.Conflict)]
    public async Task<ActionResult> Update(UpdatePrinterRequest request, string id)
    {
        // Add Auth when needed
        this._logger.LogInformation("PrinterController - Updating printer with id: {id}", id);
        var result = _context.Printers.Where((printer) => printer.Id.CompareTo(Guid.Parse(id)) == 0).SingleOrDefault();

        if(result is null)
        {
            this._logger.LogError("PrinterController - there is no printer with the id {id}!", id);
            return this.BadRequest();
        }

        var doesExists = _context.Printers.Where((printer) => string.Compare(request.Name, printer.Name) == 0 
            || printer.IP.Equals(request.Ip)).Any();

        if(doesExists)
        {
            this._logger.LogError("PrinterController - there is already a printer with the name {name} or ip {ip}!", request.Name, request.Ip);
            return this.Conflict();
        }

        try
        {
            result.Name = request.Name;
            result.AccessCode = request.AccessCode;
            result.PrinterType = request.PrinterType;
            result.IP = IPAddress.Parse(request.Ip);
            result.FirmwareVersion = request.FirmwareVersion;
            result.PrintingHours = request.PrintingHours ?? result.PrintingHours;
            result.BedId = request.BedId;

            _context.Printers.Update(result);
            await _context.SaveChangesAsync();

            this._logger.LogInformation("PrinterController - Printer successfully updated.");
            return this.Ok();
        }
        catch(Exception ex) {
            this._logger.LogError("PrinterController - Error during updating of printer {id}. Exception message: {message}", id, ex.Message);
            return this.Problem(ex.Message);
        }
    }

    [HttpDelete("delete", Name = "DeletePrinter")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<ActionResult> Delete(string id)
    {
        // Add Auth when needed
        this._logger.LogInformation("PrinterController - Deleting printer with id: {name}", id);
        var result = _context.Printers.Where((printer) => printer.Id.CompareTo(Guid.Parse(id)) == 0).SingleOrDefault();

        if(result is null)
        {
            this._logger.LogError("PrinterController - there is no printer with the id {id}!", id);
            return this.NotFound();
        }

        try
        {
            _context.Printers.Remove(result);
            await _context.SaveChangesAsync();

            this._logger.LogInformation("PrinterController - Printer successfully deleted.");
            return this.Ok();
        }
        catch(Exception ex) {
            this._logger.LogError("PrinterController - Error during deletion of printer {id}. Exception message: {message}", id, ex.Message);
            return this.Problem(ex.Message);
        }
    }
}
