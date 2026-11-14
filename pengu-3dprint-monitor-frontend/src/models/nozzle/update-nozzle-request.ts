import { ENozzleType } from './nozzle-type';

export interface UpdateNozzleRequest {
  isHardened: boolean;
  nozzleType: ENozzleType;
  printerId?: string | null;
}
