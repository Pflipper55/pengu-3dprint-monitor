import { Pipe, PipeTransform } from '@angular/core';
import { ENozzleType } from '../models/nozzle/nozzle-type';

export function nozzleTypeLabel(value: ENozzleType): string {
  switch (value) {
    case ENozzleType.POINT_ZERO_TWO:
      return '0.2 mm';
    case ENozzleType.POINT_ZERO_FOUR:
      return '0.4 mm';
    case ENozzleType.POINT_ZERO_SIX:
      return '0.6 mm';
    case ENozzleType.POINT_ZERO_EIGHT:
      return '0.8 mm';
    default:
      return 'None';
  }
}

@Pipe({
  name: 'nozzleType',
})
export class NozzleTypePipe implements PipeTransform {
  transform(value: ENozzleType): string {
    return nozzleTypeLabel(value);
  }
}
