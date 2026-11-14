import { Pipe, PipeTransform } from '@angular/core';
import { EPrinterType } from '../models/printer/printer-type';

@Pipe({
  name: 'printerType',
})
export class PrinterTypePipe implements PipeTransform {
  transform(value: EPrinterType): string {
    switch (value) {
      case EPrinterType.A1:
        return 'Bambu Lab A1';
      case EPrinterType.A1_MINI:
        return 'Bambu Lab A1 Mini';
      case EPrinterType.A2L:
        return 'Bambu Lab A2L';
      case EPrinterType.P1S:
        return 'Bambu Lab P1S';
      case EPrinterType.P2S:
        return 'Bambu Lab P2S';
      case EPrinterType.X1C:
        return 'Bambu Lab X1C';
      case EPrinterType.X2D:
        return 'Bambu Lab X2D';
      case EPrinterType.H2S:
        return 'Bambu Lab H2S';
      case EPrinterType.H2D:
        return 'Bambu Lab H2D';
      case EPrinterType.H3C:
        return 'Bambu Lab H3C';
      default:
        return 'None';
    }
  }
}
