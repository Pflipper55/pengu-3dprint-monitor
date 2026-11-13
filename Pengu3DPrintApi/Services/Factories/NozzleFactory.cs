using Pengu3DPrintApi.Data.DTO.Nozzle;
using Pengu3DPrintApi.Data.Entities;

namespace Pengu3DPrintApi.Services.Factories;

public abstract class NozzleFactory
{
    public static Nozzle Create(CreateNozzleRequest request)
    {
        return new Nozzle
        {
            IsHardened = request.IsHardened,
            NozzleType = request.NozzleType,
            PrinterId = request.PrinterId
        };
    }
}
