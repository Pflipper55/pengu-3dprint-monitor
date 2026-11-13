using Microsoft.AspNetCore.Mvc;
using Pengu3DPrintApi.Data.Entities;

namespace Pengu3DPrintApi.Controllers;

[ApiController]
[Route("[controller]")]
public class PrinterController : ControllerBase
{
    [HttpGet(Name = "GetPrinters")]
    [Route("/all")]
    public IEnumerable<Printer> GetAllPrinters()
    {
        var test = new Printer()
        {
            Name = "Test",
        };

        
        return [test];
    }
}
