import { EPrinterType } from './printer-type';

export interface UpdatePrinterRequest {
  name: string;
  printerType: EPrinterType;
  ip: string;
  accessCode: string;
  serialNumber: string;
  firmwareVersion: string;
  printingHours?: number | null;
  bedId?: string | null;
  nozzleIds?: string[];
  filamentIds?: string[];
}
