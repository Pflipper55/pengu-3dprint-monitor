import { Pipe, PipeTransform } from '@angular/core';
import { EBedType } from '../models/bed/bed-type';

@Pipe({
  name: 'bedType',
})
export class BedTypePipe implements PipeTransform {
  transform(value: EBedType): string {
    switch (value) {
      case EBedType.TEXTURED_PEI:
        return 'Textured PEI';
      case EBedType.SMOOTH_PEI_HIGH_TEMP:
        return 'Smooth PEI High Temp';
      case EBedType.COOL_SUPER_TRACK:
        return 'Cool Super Track';
      default:
        return 'None';
    }
  }
}
