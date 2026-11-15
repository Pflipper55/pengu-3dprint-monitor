import { Pipe, PipeTransform } from '@angular/core';
import { EFilamentType } from '../models/filament/filament-type';

@Pipe({
  name: 'filamentType',
})
export class FilamentTypePipe implements PipeTransform {
  transform(value: EFilamentType): string {
    switch (value) {
      case EFilamentType.PLA:
        return 'PLA';
      case EFilamentType.PETG:
        return 'PETG';
      case EFilamentType.TPU:
        return 'TPU';
      case EFilamentType.ABS:
        return 'ABS';
      case EFilamentType.ASA:
        return 'ASA';
      case EFilamentType.PA:
        return 'PA';
      default:
        return 'None';
    }
  }
}
