using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pengu3DPrintApi.Data;
using Pengu3DPrintApi.Data.DTO.Nozzle;
using Pengu3DPrintApi.Services.Factories;

namespace Pengu3DPrintApi.Controllers;

[ApiController]
[Route("[controller]")]
public class NozzleController : ControllerBase
{
    private readonly PenguMonitorDbContext _context;
    private readonly ILogger<NozzleController> _logger;

    public NozzleController(PenguMonitorDbContext context, ILogger<NozzleController> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpGet("all", Name = "GetNozzles")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NoContent)]
    public async Task<ActionResult<IEnumerable<NozzleOverviewModel>>> GetAllNozzles()
    {
        _logger.LogInformation("NozzleController - Getting all nozzles");
        var result = await _context.Nozzles
            .Select(nozzle => new NozzleOverviewModel
            {
                Id = nozzle.Id,
                IsHardened = nozzle.IsHardened,
                NozzleType = nozzle.NozzleType,
                PrinterId = nozzle.PrinterId
            })
            .ToListAsync();

        if (result.Count == 0)
        {
            _logger.LogInformation("NozzleController - no nozzles added!");
            return NoContent();
        }

        return Ok(result);
    }

    [HttpGet("{id}", Name = "GetNozzle")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<ActionResult<NozzleOverviewModel>> GetById(Guid id)
    {
        _logger.LogInformation("NozzleController - Getting nozzle with id: {id}", id);
        var nozzle = await _context.Nozzles
            .Where(nozzle => nozzle.Id == id)
            .Select(nozzle => new NozzleOverviewModel
            {
                Id = nozzle.Id,
                IsHardened = nozzle.IsHardened,
                NozzleType = nozzle.NozzleType,
                PrinterId = nozzle.PrinterId
            })
            .SingleOrDefaultAsync();

        if (nozzle is null)
        {
            _logger.LogInformation("NozzleController - no nozzle with id: {id}!", id);
            return NotFound();
        }

        return Ok(nozzle);
    }

    [HttpPost("create", Name = "CreateNozzle")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<ActionResult> Create(CreateNozzleRequest request)
    {
        _logger.LogInformation("NozzleController - Creating nozzle");

        if (!await PrinterExists(request.PrinterId))
        {
            _logger.LogWarning("NozzleController - printer with id {printerId} does not exist.", request.PrinterId);
            return BadRequest();
        }

        var entity = NozzleFactory.Create(request);

        try
        {
            _context.Nozzles.Add(entity);
            await _context.SaveChangesAsync();

            _logger.LogInformation("NozzleController - Nozzle successfully added.");
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "NozzleController - Error during creation of nozzle.");
            return Problem(ex.Message);
        }
    }

    [HttpPost("update", Name = "UpdateNozzle")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<ActionResult> Update(
        UpdateNozzleRequest request,
        string id)
    {
        _logger.LogInformation("NozzleController - Updating nozzle with id: {id}", id);
        if (!Guid.TryParse(id, out var nozzleId))
        {
            _logger.LogWarning("NozzleController - invalid nozzle id: {id}", id);
            return BadRequest();
        }

        var nozzle = await _context.Nozzles
            .SingleOrDefaultAsync(nozzle => nozzle.Id == nozzleId);
        if (nozzle is null)
        {
            _logger.LogError("NozzleController - there is no nozzle with the id {id}!", id);
            return NotFound();
        }

        if (!await PrinterExists(request.PrinterId))
        {
            _logger.LogWarning("NozzleController - printer with id {printerId} does not exist.", request.PrinterId);
            return BadRequest();
        }

        try
        {
            nozzle.IsHardened = request.IsHardened;
            nozzle.NozzleType = request.NozzleType;
            nozzle.PrinterId = request.PrinterId;

            await _context.SaveChangesAsync();

            _logger.LogInformation("NozzleController - Nozzle successfully updated.");
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "NozzleController - Error during updating of nozzle {id}.", id);
            return Problem(ex.Message);
        }
    }

    [HttpDelete("delete", Name = "DeleteNozzle")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<ActionResult> Delete(string id)
    {
        _logger.LogInformation("NozzleController - Deleting nozzle with id: {id}", id);
        if (!Guid.TryParse(id, out var nozzleId))
        {
            _logger.LogWarning("NozzleController - invalid nozzle id: {id}", id);
            return BadRequest();
        }

        var nozzle = await _context.Nozzles
            .SingleOrDefaultAsync(nozzle => nozzle.Id == nozzleId);
        if (nozzle is null)
        {
            _logger.LogError("NozzleController - there is no nozzle with the id {id}!", id);
            return NotFound();
        }

        try
        {
            _context.Nozzles.Remove(nozzle);
            await _context.SaveChangesAsync();

            _logger.LogInformation("NozzleController - Nozzle successfully deleted.");
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "NozzleController - Error during deletion of nozzle {id}.", id);
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
