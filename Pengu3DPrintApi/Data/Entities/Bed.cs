using System.Net;
using Pengu3DPrintApi.Data.Enums;

namespace Pengu3DPrintApi.Data.Entities;

public class Bed
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public Guid? PrinterId {get; set;} = default;

    public Printer? InsertedPrinter {get; set;} = default;
    
    public string BrandName { get; set;} = string.Empty;

    public EBedType BedType {get; set;} = EBedType.NONE;
}