import { EFilamentType } from './filament-type';

export interface UpdateFilamentRequest {
  brandName: string;
  filamentType: EFilamentType;
  weight: number;
  colorCode: string;
  printerId?: string | null;
}
