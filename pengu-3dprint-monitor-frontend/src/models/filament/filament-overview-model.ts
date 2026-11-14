import { EFilamentType } from './filament-type';

export interface FilamentOverviewModel {
  id: string;
  brandName: string;
  filamentType: EFilamentType;
  weight: number;
  colorCode: string;
  printerId: string | null;
}
