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
import { CreatePrinterModal } from '../../modals/create-printer-modal/create-printer-modal';
import { ToastModule } from '@openng/optimus-ui/toast';
import { MessageService } from '@openng/optimus-ui/api';

@Component({
  selector: 'app-printers',
  standalone: true,
  imports: [
    ButtonModule,
    TableModule,
    PrinterTypePipe,
    PrinterSvgPipe,
    PrinterDetailsModal,
    CreatePrinterModal,
    ToastModule,
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './printers.html',
})
export class Printers implements OnInit {
  @ViewChild(PrinterDetailsModal) private printerDetailsModal!: PrinterDetailsModal;
  @ViewChild(CreatePrinterModal) private createPrinterModal!: CreatePrinterModal;

  public printers = signal<PrinterOverviewModel[]>([]);

  private printerApiService = inject(ApiPrinterService);

  public ngOnInit(): void {
    this.loadPrinters();
  }

  public loadPrinters(): void {
    this.printerApiService.getAllPrinters().subscribe((data) => {
      this.printers.set(data ?? []);
    });
  }

  public showCreatePrinter(): void {
    this.createPrinterModal.show();
  }

  public showPrinterDetails(printerId: string): void {
    this.printerDetailsModal.show(printerId);
  }
}
