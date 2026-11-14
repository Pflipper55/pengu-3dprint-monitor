import { EPrinterType } from './printer-type';

export interface CreatePrinterRequest {
  name: string;
  printerType: EPrinterType;
  ip: string;
  accessCode: string;
  firmwareVersion: string;
  printingHours?: number | null;
}
