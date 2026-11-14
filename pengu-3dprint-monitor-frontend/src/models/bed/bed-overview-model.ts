import { EBedType } from './bed-type';

export interface BedOverviewModel {
  id: string;
  brandName: string;
  bedType: EBedType;
  printerId: string | null;
}
