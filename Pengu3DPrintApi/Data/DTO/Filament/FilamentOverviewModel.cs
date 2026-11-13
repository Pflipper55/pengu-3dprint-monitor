using Pengu3DPrintApi.Data.Enums;

namespace Pengu3DPrintApi.Data.DTO.Filament;

public class FilamentOverviewModel
{
    public Guid Id { get; set; }
    public string BrandName { get; set; } = string.Empty;
    public EFilamentType FilamentType { get; set; }
    public double Weight { get; set; }
    public string ColorCode { get; set; } = string.Empty;
    public Guid? PrinterId { get; set; }
}
