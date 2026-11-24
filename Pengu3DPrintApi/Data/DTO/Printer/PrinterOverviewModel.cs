using Pengu3DPrintApi.Data.Enums;

namespace Pengu3DPrintApi.Data.DTO.Printer;

public class PrinterOverviewModel
{
    public Guid Id { get; set;}
    public string Name { get; set; }
    public EPrinterType PrinterType { get; set; }
    public string Ip { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public string FirmwareVersion { get; set; }
}