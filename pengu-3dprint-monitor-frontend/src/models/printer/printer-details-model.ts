import { BedOverviewModel } from '../bed/bed-overview-model';
import { FilamentOverviewModel } from '../filament/filament-overview-model';
import { NozzleOverviewModel } from '../nozzle/nozzle-overview-model';
import { EPrinterType } from './printer-type';

export interface PrinterDetailsModel {
  id: string;
  name: string;
  printerType: EPrinterType;
  ip: string;
  accessCode: string;
  printingHours: number;
  firmwareVersion: string;
  nozzles: NozzleOverviewModel[];
  loadedFilaments: FilamentOverviewModel[];
  usedBed: BedOverviewModel | null;
}
