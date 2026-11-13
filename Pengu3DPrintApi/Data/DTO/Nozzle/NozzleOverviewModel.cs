using Pengu3DPrintApi.Data.Enums;

namespace Pengu3DPrintApi.Data.DTO.Nozzle;

public class NozzleOverviewModel
{
    public Guid Id { get; set; }
    public bool IsHardened { get; set; }
    public ENozzleType NozzleType { get; set; }
    public Guid? PrinterId { get; set; }
}
