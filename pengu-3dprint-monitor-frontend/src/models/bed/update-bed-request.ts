import { EBedType } from './bed-type';

export interface UpdateBedRequest {
  brandName: string;
  bedType: EBedType;
  printerId?: string | null;
}
