import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { TableModule } from '@openng/optimus-ui/table';
import { ApiPrinterService } from '../../services/api-printer-service';
import { PrinterOverviewModel } from '../../models/printer/printer-overview-model';
import { PrinterTypePipe } from '../../pipes/printer-type-pipe';
import { PrinterSvgPipe } from '../../pipes/printer-svg-pipe';
import { PrinterDetailsModal } from '../../modals/printer-details-modal/printer-details-modal';

@Component({
  selector: 'app-printers',
  standalone: true,
  imports: [ButtonModule, TableModule, PrinterTypePipe, PrinterSvgPipe, PrinterDetailsModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './printers.html',
})
export class Printers implements OnInit {
  @ViewChild(PrinterDetailsModal) private printerDetailsModal!: PrinterDetailsModal;

  public printers = signal<PrinterOverviewModel[]>([]);

  private printerApiService = inject(ApiPrinterService);
  public ngOnInit(): void {
    this.printerApiService.getAllPrinters().subscribe((data) => {
      this.printers.set(data ?? []);
    });
  }

  public showPrinterDetails(printerId: string): void {
    this.printerDetailsModal.show(printerId);
  }
}
