using Pengu3DPrintApi.Data.Enums;

namespace Pengu3DPrintApi.Data.DTO.Filament;

public class UpdateFilamentRequest
{
    public string BrandName { get; set; } = string.Empty;
    public EFilamentType FilamentType { get; set; }
    public double Weight { get; set; }
    public string ColorCode { get; set; } = "#FFFFFF";
    public Guid? PrinterId { get; set; }
}
