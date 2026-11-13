using Pengu3DPrintApi.Data.Enums;

namespace Pengu3DPrintApi.Data.DTO.Bed;

public class UpdateBedRequest
{
    public string BrandName { get; set; } = string.Empty;
    public EBedType BedType { get; set; }
    public Guid? PrinterId { get; set; }
}
