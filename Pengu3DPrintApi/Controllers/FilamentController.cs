using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pengu3DPrintApi.Data;
using Pengu3DPrintApi.Data.DTO.Filament;
using Pengu3DPrintApi.Services.Factories;

namespace Pengu3DPrintApi.Controllers;

[ApiController]
[Route("[controller]")]
public class FilamentController : ControllerBase
{
    private readonly PenguMonitorDbContext _context;
    private readonly ILogger<FilamentController> _logger;

    public FilamentController(PenguMonitorDbContext context, ILogger<FilamentController> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpGet("all", Name = "GetFilaments")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NoContent)]
    public async Task<ActionResult<IEnumerable<FilamentOverviewModel>>> GetAllFilaments()
    {
        _logger.LogInformation("FilamentController - Getting all filaments");
        var result = await _context.Filaments
            .Select(filament => new FilamentOverviewModel
            {
                Id = filament.Id,
                BrandName = filament.BrandName,
                FilamentType = filament.FilamentType,
                Weight = filament.Weight,
                ColorCode = filament.ColorCode,
                PrinterId = filament.PrinterId
            })
            .ToListAsync();

        if (result.Count == 0)
        {
            _logger.LogInformation("FilamentController - no filaments added!");
            return NoContent();
        }

        return Ok(result);
    }

    [HttpGet("{id}", Name = "GetFilament")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<ActionResult<FilamentOverviewModel>> GetById(Guid id)
    {
        _logger.LogInformation("FilamentController - Getting filament with id: {id}", id);
        var filament = await _context.Filaments
            .Where(filament => filament.Id == id)
            .Select(filament => new FilamentOverviewModel
            {
                Id = filament.Id,
                BrandName = filament.BrandName,
                FilamentType = filament.FilamentType,
                Weight = filament.Weight,
                ColorCode = filament.ColorCode,
                PrinterId = filament.PrinterId
            })
            .SingleOrDefaultAsync();

        if (filament is null)
        {
            _logger.LogInformation("FilamentController - no filament with id: {id}!", id);
            return NotFound();
        }

        return Ok(filament);
    }

    [HttpPost("create", Name = "CreateFilament")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<ActionResult> Create(CreateFilamentRequest request)
    {
        _logger.LogInformation("FilamentController - Creating filament with brand: {brandName}", request.BrandName);

        if (!await PrinterExists(request.PrinterId))
        {
            _logger.LogWarning("FilamentController - printer with id {printerId} does not exist.", request.PrinterId);
            return BadRequest();
        }

        var entity = FilamentFactory.Create(request);

        try
        {
            _context.Filaments.Add(entity);
            await _context.SaveChangesAsync();

            _logger.LogInformation("FilamentController - Filament successfully added.");
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "FilamentController - Error during creation of filament.");
            return Problem(ex.Message);
        }
    }

    [HttpPost("update", Name = "UpdateFilament")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<ActionResult> Update(
        UpdateFilamentRequest request,
        string id)
    {
        _logger.LogInformation("FilamentController - Updating filament with id: {id}", id);
        if (!Guid.TryParse(id, out var filamentId))
        {
            _logger.LogWarning("FilamentController - invalid filament id: {id}", id);
            return BadRequest();
        }

        var filament = await _context.Filaments
            .SingleOrDefaultAsync(filament => filament.Id == filamentId);
        if (filament is null)
        {
            _logger.LogError("FilamentController - there is no filament with the id {id}!", id);
            return NotFound();
        }

        if (!await PrinterExists(request.PrinterId))
        {
            _logger.LogWarning("FilamentController - printer with id {printerId} does not exist.", request.PrinterId);
            return BadRequest();
        }

        try
        {
            filament.BrandName = request.BrandName;
            filament.FilamentType = request.FilamentType;
            filament.Weight = request.Weight;
            filament.ColorCode = request.ColorCode;
            filament.PrinterId = request.PrinterId;

            await _context.SaveChangesAsync();

            _logger.LogInformation("FilamentController - Filament successfully updated.");
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "FilamentController - Error during updating of filament {id}.", id);
            return Problem(ex.Message);
        }
    }

    [HttpDelete("delete", Name = "DeleteFilament")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<ActionResult> Delete(string id)
    {
        _logger.LogInformation("FilamentController - Deleting filament with id: {id}", id);
        if (!Guid.TryParse(id, out var filamentId))
        {
            _logger.LogWarning("FilamentController - invalid filament id: {id}", id);
            return BadRequest();
        }

        var filament = await _context.Filaments
            .SingleOrDefaultAsync(filament => filament.Id == filamentId);
        if (filament is null)
        {
            _logger.LogError("FilamentController - there is no filament with the id {id}!", id);
            return NotFound();
        }

        try
        {
            _context.Filaments.Remove(filament);
            await _context.SaveChangesAsync();

            _logger.LogInformation("FilamentController - Filament successfully deleted.");
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "FilamentController - Error during deletion of filament {id}.", id);
            return Problem(ex.Message);
        }
    }

    private Task<bool> PrinterExists(Guid? printerId)
    {
        return printerId is null
            ? Task.FromResult(true)
            : _context.Printers.AnyAsync(printer => printer.Id == printerId.Value);
    }
}
