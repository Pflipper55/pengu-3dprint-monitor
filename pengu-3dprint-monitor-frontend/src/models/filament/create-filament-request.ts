import { EFilamentType } from './filament-type';

export interface CreateFilamentRequest {
  brandName: string;
  filamentType: EFilamentType;
  weight: number;
  colorCode: string;
  printerId?: string | null;
}
