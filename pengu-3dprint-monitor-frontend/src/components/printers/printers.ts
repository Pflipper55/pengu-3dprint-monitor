import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { Table, TableModule } from '@openng/optimus-ui/table';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { ConfirmDialogModule } from '@openng/optimus-ui/confirmdialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { ApiPrinterService } from '../../services/api-printer-service';
import { PrinterOverviewModel } from '../../models/printer/printer-overview-model';
import { PrinterTypePipe } from '../../pipes/printer-type-pipe';
import { PrinterSvgPipe } from '../../pipes/printer-svg-pipe';
import { PrinterDetailsModal } from '../../modals/printer-details-modal/printer-details-modal';
import { CreatePrinterModal } from '../../modals/create-printer-modal/create-printer-modal';
import { EditPrinterModal } from '../../modals/edit-printer-modal/edit-printer-modal';
import { ToastModule } from '@openng/optimus-ui/toast';
import { HttpErrorResponse } from '@angular/common/http';
import { PrinterStatusService } from '../../services/printer-status-service';

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
    EditPrinterModal,
    ToastModule,
    ConfirmDialogModule,
    InputTextModule,
  ],
  providers: [MessageService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './printers.html',
})
export class Printers implements OnInit, OnDestroy {
  @ViewChild(PrinterDetailsModal) private printerDetailsModal!: PrinterDetailsModal;
  @ViewChild(CreatePrinterModal) private createPrinterModal!: CreatePrinterModal;
  @ViewChild(EditPrinterModal) private editPrinterModal!: EditPrinterModal;

  public printers = signal<PrinterOverviewModel[]>([]);

  private printerApiService = inject(ApiPrinterService);
  public readonly printerStatusService = inject(PrinterStatusService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  public ngOnInit(): void {
    this.loadPrinters();
    this.printerStatusService.connect();
  }

  public ngOnDestroy(): void {
    this.printerStatusService.disconnect();
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

  public showEditPrinter(printerId: string): void {
    this.editPrinterModal.show(printerId);
  }

  public filterPrinters(table: Table, event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      table.filterGlobal(target.value, 'contains');
    }
  }

  public confirmDeletePrinter(printer: PrinterOverviewModel): void {
    this.confirmationService.confirm({
      header: 'Delete printer',
      message: `Are you sure you want to delete "${printer.name}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deletePrinter(printer.id, printer.name),
    });
  }

  private deletePrinter(printerId: string, printerName: string): void {
    this.printerApiService.deletePrinter(printerId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Printer deleted',
          detail: `${printerName} was deleted successfully.`,
        });
        this.loadPrinters();
      },
      error: (error: HttpErrorResponse) => {
        const detail =
          typeof error.error === 'object' && error.error !== null && 'detail' in error.error
            ? error.error.detail
            : null;
        this.messageService.add({
          severity: 'error',
          summary: 'Could not delete printer',
          detail:
            typeof detail === 'string'
              ? detail
              : 'An error occurred while deleting the printer. Please try again.',
        });
      },
    });
  }
}
