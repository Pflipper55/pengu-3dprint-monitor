import { EPrinterType } from './printer-type';

export interface PrinterOverviewModel {
  id: string;
  name: string;
  printerType: EPrinterType;
  ip: string;
  firmwareVersion: string;
}
