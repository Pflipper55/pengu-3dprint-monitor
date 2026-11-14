import { ENozzleType } from './nozzle-type';

export interface NozzleOverviewModel {
  id: string;
  isHardened: boolean;
  nozzleType: ENozzleType;
  printerId: string | null;
}
