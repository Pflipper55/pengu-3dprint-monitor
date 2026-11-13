using Pengu3DPrintApi.Data.DTO.Bed;
using Pengu3DPrintApi.Data.DTO.Filament;
using Pengu3DPrintApi.Data.DTO.Nozzle;
using Pengu3DPrintApi.Data.Enums;

namespace Pengu3DPrintApi.Data.DTO.Printer;

public class PrinterDetailsModel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public EPrinterType PrinterType { get; set; }
    public string Ip { get; set; } = string.Empty;

    public string AccessCode { get; set; } = string.Empty;

    public int PrintingHours { get; set; }

    public string FirmwareVersion { get; set; } = string.Empty;
    public List<NozzleOverviewModel> Nozzles { get; set; } = [];
    public List<FilamentOverviewModel> LoadedFilaments { get; set; } = [];
    public BedOverviewModel? UsedBed { get; set; }
}