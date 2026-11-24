using System.Net;
using Pengu3DPrintApi.Data.DTO.Printer;
using Pengu3DPrintApi.Data.Entities;

namespace Pengu3DPrintApi.Services.Factories;

public abstract class PrinterFactory
{
    public static Printer Create(CreatePrinterRequest request)
    {
        return new Printer(
            request.Name,
            request.PrinterType,
            IPAddress.Parse(request.Ip),
            request.AccessCode,
            request.SerialNumber,
            request.FirmwareVersion,
            request.PrintingHours ?? 0);
    }
}