import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DataViewModule } from '@openng/optimus-ui/dataview';
import { ApiPrinterService } from '../../services/api-printer-service';
import { PrinterOverviewModel } from '../../models/printer/printer-overview-model';
import { CommonModule } from '@angular/common';
import { PrinterTypePipe } from '../../pipes/printer-type-pipe';
import { PrinterSvgPipe } from '../../pipes/printer-svg-pipe';

@Component({
  selector: 'app-printers',
  standalone: true,
  imports: [CommonModule, ButtonModule, DataViewModule, PrinterTypePipe, PrinterSvgPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './printers.html',
})
export class Printers implements OnInit {
  public printers = signal<PrinterOverviewModel[]>([]);

  private printerApiService = inject(ApiPrinterService);
  public ngOnInit(): void {
    this.printerApiService.getAllPrinters().subscribe((data) => {
      this.printers.set(data ?? []);
    });
  }
}
