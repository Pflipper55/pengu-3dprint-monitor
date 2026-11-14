import { ENozzleType } from './nozzle-type';

export interface CreateNozzleRequest {
  isHardened: boolean;
  nozzleType: ENozzleType;
  printerId?: string | null;
}
