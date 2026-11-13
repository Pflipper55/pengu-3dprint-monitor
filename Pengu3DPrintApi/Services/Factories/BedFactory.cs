using Pengu3DPrintApi.Data.DTO.Bed;
using Pengu3DPrintApi.Data.Entities;

namespace Pengu3DPrintApi.Services.Factories;

public abstract class BedFactory
{
    public static Bed Create(CreateBedRequest request)
    {
        return new Bed
        {
            BrandName = request.BrandName,
            BedType = request.BedType,
            PrinterId = request.PrinterId
        };
    }
}
