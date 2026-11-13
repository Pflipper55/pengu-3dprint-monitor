using Pengu3DPrintApi.Data.Enums;

namespace Pengu3DPrintApi.Data.DTO.Printer;

public class CreatePrinterRequest
{
    public string Name { get; set; }
    public EPrinterType PrinterType { get; set; }
    public string Ip { get; set; }
    public string AccessCode { get; set;} 
    public string FirmwareVersion { get; set;}
    public int? PrintingHours { get; set;}
}