using Pengu3DPrintApi.Data.Enums;

namespace Pengu3DPrintApi.Data.Entities;

public class Nozzle
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public bool IsHardened { get; set; } = false;

    public ENozzleType NozzleType { get; set; } = ENozzleType.NONE;

    public Guid? PrinterId { get; set; } = default;

    public Printer? InsertedPrinter { get; set;} = default;
}