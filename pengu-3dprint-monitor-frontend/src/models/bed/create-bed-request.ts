import { EBedType } from './bed-type';

export interface CreateBedRequest {
  brandName: string;
  bedType: EBedType;
  printerId?: string | null;
}
