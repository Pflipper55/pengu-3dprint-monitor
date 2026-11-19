import { Pipe, PipeTransform } from '@angular/core';

export function nozzleHardenedLabel(value: boolean): string {
  switch (value) {
    case true:
      return 'Hardened';
    case false:
      return 'Not Hardened';
    default:
      return 'Unknown';
  }
}

@Pipe({
  name: 'nozzleHardened',
})
export class NozzleHardenedPipe implements PipeTransform {
  transform(value: boolean): string {
    return nozzleHardenedLabel(value);
  }
}
