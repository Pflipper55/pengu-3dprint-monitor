using Pengu3DPrintApi.Data.Enums;

namespace Pengu3DPrintApi.Data.Entities;

public class Filament
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public Guid? PrinterId {get; set;} = default;

    public Printer? LoadedPrinter {get; set;} = default;

    public string BrandName { get; set;} = string.Empty;

    public EFilamentType FilamentType {get; set;} = EFilamentType.NONE;

    public double Weight { get; set;} = 1000.0;

    public string ColorCode { get; set; } = "#FFFFFF";
}