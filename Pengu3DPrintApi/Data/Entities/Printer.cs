using System.Net;
using Pengu3DPrintApi.Data.Enums;

namespace Pengu3DPrintApi.Data.Entities;

public class Printer
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public string Name { get; set;} = string.Empty;

    public EPrinterType PrinterType { get; set; } = EPrinterType.NONE;

    public IPAddress IP { get; set; } = IPAddress.None;

    public string AccessCode { get; private set; } = string.Empty;

    public string FirmwareVersion { get; set;} = string.Empty;

    public int PrintingHours { get; set; } = 0;

    public ICollection<Filament> LoadedFilaments { get; set;} = new List<Filament>();

    public ICollection<Nozzle> Nozzles { get; set; } = new List<Nozzle>();

    public Guid? BedId { get; set; } = default;

    public Bed? UsedBed { get; set;} = default;
}