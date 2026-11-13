using Pengu3DPrintApi.Data.DTO.Filament;
using Pengu3DPrintApi.Data.Entities;

namespace Pengu3DPrintApi.Services.Factories;

public abstract class FilamentFactory
{
    public static Filament Create(CreateFilamentRequest request)
    {
        return new Filament
        {
            BrandName = request.BrandName,
            FilamentType = request.FilamentType,
            Weight = request.Weight,
            ColorCode = request.ColorCode,
            PrinterId = request.PrinterId
        };
    }
}
