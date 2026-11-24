export type PrinterConnectionState = 'Connecting' | 'Online' | 'Offline' | 'Unknown';

export interface PrinterStatusUpdate {
  id: string;
  status: PrinterConnectionState;
  version: number;
}
