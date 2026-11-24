namespace Pengu3DPrintApi.Data.DTO.Printer;

public sealed record PrinterStatusUpdate(Guid Id, string Status, long Version);
