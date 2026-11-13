using Pengu3DPrintApi.Data.Enums;

namespace Pengu3DPrintApi.Data.DTO.Nozzle;

public class CreateNozzleRequest
{
    public bool IsHardened { get; set; }
    public ENozzleType NozzleType { get; set; }
    public Guid? PrinterId { get; set; }
}
