import { Pipe, PipeTransform } from '@angular/core';
import { EPrinterType } from '../models/printer/printer-type';

@Pipe({
  name: 'printerSvg',
})
export class PrinterSvgPipe implements PipeTransform {
  transform(value: EPrinterType): string {
    switch (value) {
      case EPrinterType.A1:
        return '/assets/svgs/printer_thumbnail_n2s.svg';
      case EPrinterType.A1_MINI:
        return '/assets/svgs/printer_thumbnail_n1.svg';
      case EPrinterType.A2L:
        return '/assets/svgs/printer_thumbnail_n2s.svg';
      case EPrinterType.P1S:
        return '/assets/svgs/printer_thumbnail_p1s.svg';
      case EPrinterType.P2S:
        return '/assets/svgs/printer_thumbnail_p2s.svg';
      case EPrinterType.X1C:
        return '/assets/svgs/printer_thumbnail_x1c.svg';
      case EPrinterType.H2D:
        return '/assets/svgs/printer_thumbnail_h2d.svg';
      default:
        return '/assets/svgs/printer_thumbnail.svg';
    }
  }
}
