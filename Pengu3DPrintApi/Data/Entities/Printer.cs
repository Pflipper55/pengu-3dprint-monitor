using System.Net;
using Pengu3DPrintApi.Data.Enums;

namespace Pengu3DPrintApi.Data.Entities;

public class Printer
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public string Name { get; set;} = string.Empty;

    public EPrinterType PrinterType { get; set; } = EPrinterType.NONE;

    public IPAddress IP { get; set; } = IPAddress.None;

    public string AccessCode { get; set; } = string.Empty;

    public string FirmwareVersion { get; set;} = string.Empty;

    public int PrintingHours { get; set; } = 0;

    public ICollection<Filament> LoadedFilaments { get; set;} = new List<Filament>();

    public ICollection<Nozzle> Nozzles { get; set; } = new List<Nozzle>();

    public Guid? BedId { get; set; } = default;

    public Bed? UsedBed { get; set;} = default;

    public Printer()
    {
        
    }

    public Printer(string name, EPrinterType ePrinterType, IPAddress iPAddress, string accessCode, string firmwareVersion, int printingHours = 0)
    {
        this.Id = Guid.NewGuid();
        this.Name = name;
        this.PrinterType = ePrinterType;
        this.IP = iPAddress;
        this.AccessCode = accessCode;
        this.PrintingHours = printingHours;
        this.FirmwareVersion = firmwareVersion;
    }
}