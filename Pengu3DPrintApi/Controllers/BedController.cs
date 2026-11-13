using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pengu3DPrintApi.Data;
using Pengu3DPrintApi.Data.DTO.Bed;
using Pengu3DPrintApi.Services.Factories;

namespace Pengu3DPrintApi.Controllers;

[ApiController]
[Route("[controller]")]
public class BedController : ControllerBase
{
    private readonly PenguMonitorDbContext _context;
    private readonly ILogger<BedController> _logger;

    public BedController(PenguMonitorDbContext context, ILogger<BedController> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpGet("all", Name = "GetBeds")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NoContent)]
    public async Task<ActionResult<IEnumerable<BedOverviewModel>>> GetAllBeds()
    {
        _logger.LogInformation("BedController - Getting all beds");
        var result = await _context.Beds
            .Select(bed => new BedOverviewModel
            {
                Id = bed.Id,
                BrandName = bed.BrandName,
                BedType = bed.BedType,
                PrinterId = bed.PrinterId
            })
            .ToListAsync();

        if (result.Count == 0)
        {
            _logger.LogInformation("BedController - no beds added!");
            return NoContent();
        }

        return Ok(result);
    }

    [HttpGet("{id}", Name = "GetBed")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<ActionResult<BedOverviewModel>> GetById(Guid id)
    {
        _logger.LogInformation("BedController - Getting bed with id: {id}", id);
        var bed = await _context.Beds
            .Where(bed => bed.Id == id)
            .Select(bed => new BedOverviewModel
            {
                Id = bed.Id,
                BrandName = bed.BrandName,
                BedType = bed.BedType,
                PrinterId = bed.PrinterId
            })
            .SingleOrDefaultAsync();

        if (bed is null)
        {
            _logger.LogInformation("BedController - no bed with id: {id}!", id);
            return NotFound();
        }

        return Ok(bed);
    }

    [HttpPost("create", Name = "CreateBed")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    [ProducesResponseType((int)HttpStatusCode.Conflict)]
    public async Task<ActionResult> Create(CreateBedRequest request)
    {
        _logger.LogInformation("BedController - Creating bed with brand: {brandName}", request.BrandName);

        var printerError = await ValidatePrinterAssignment(request.PrinterId, null);
        if (printerError is not null)
        {
            return printerError;
        }

        var entity = BedFactory.Create(request);

        try
        {
            _context.Beds.Add(entity);
            await _context.SaveChangesAsync();

            _logger.LogInformation("BedController - Bed successfully added.");
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "BedController - Error during creation of bed.");
            return Problem(ex.Message);
        }
    }

    [HttpPost("update", Name = "UpdateBed")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    [ProducesResponseType((int)HttpStatusCode.Conflict)]
    public async Task<ActionResult> Update(
        UpdateBedRequest request,
        string id)
    {
        _logger.LogInformation("BedController - Updating bed with id: {id}", id);
        if (!Guid.TryParse(id, out var bedId))
        {
            _logger.LogWarning("BedController - invalid bed id: {id}", id);
            return BadRequest();
        }

        var bed = await _context.Beds.SingleOrDefaultAsync(bed => bed.Id == bedId);
        if (bed is null)
        {
            _logger.LogError("BedController - there is no bed with the id {id}!", id);
            return NotFound();
        }

        var printerError = await ValidatePrinterAssignment(request.PrinterId, bedId);
        if (printerError is not null)
        {
            return printerError;
        }

        try
        {
            bed.BrandName = request.BrandName;
            bed.BedType = request.BedType;
            bed.PrinterId = request.PrinterId;

            await _context.SaveChangesAsync();

            _logger.LogInformation("BedController - Bed successfully updated.");
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "BedController - Error during updating of bed {id}.", id);
            return Problem(ex.Message);
        }
    }

    [HttpDelete("delete", Name = "DeleteBed")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<ActionResult> Delete(string id)
    {
        _logger.LogInformation("BedController - Deleting bed with id: {id}", id);
        if (!Guid.TryParse(id, out var bedId))
        {
            _logger.LogWarning("BedController - invalid bed id: {id}", id);
            return BadRequest();
        }

        var bed = await _context.Beds.SingleOrDefaultAsync(bed => bed.Id == bedId);
        if (bed is null)
        {
            _logger.LogError("BedController - there is no bed with the id {id}!", id);
            return NotFound();
        }

        try
        {
            _context.Beds.Remove(bed);
            await _context.SaveChangesAsync();

            _logger.LogInformation("BedController - Bed successfully deleted.");
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "BedController - Error during deletion of bed {id}.", id);
            return Problem(ex.Message);
        }
    }

    private async Task<ActionResult?> ValidatePrinterAssignment(
        Guid? printerId,
        Guid? bedId)
    {
        // In case the user did not send a printerId (i.e deleting assignment or creation of bed without printer)
        if (printerId is null)
        {
            return null;
        }

        var printerExists = await _context.Printers
            .AnyAsync(printer => printer.Id == printerId.Value);
        if (!printerExists)
        {
            _logger.LogWarning("BedController - printer with id {printerId} does not exist.", printerId);
            return BadRequest();
        }

        var bedsForPrinter = _context.Beds.Where(bed => bed.PrinterId == printerId.Value);
        if (bedId.HasValue)
        {
            bedsForPrinter = bedsForPrinter.Where(bed => bed.Id != bedId.Value);
        }

        var printerHasAnotherBed = await bedsForPrinter.AnyAsync();
        if (printerHasAnotherBed)
        {
            _logger.LogWarning("BedController - printer with id {printerId} already has a bed assigned.", printerId);
            return Conflict();
        }

        return null;
    }
}
