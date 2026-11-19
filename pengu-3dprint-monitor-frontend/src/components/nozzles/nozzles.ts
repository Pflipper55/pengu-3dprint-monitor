import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from '@openng/optimus-ui/button';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { ConfirmDialogModule } from '@openng/optimus-ui/confirmdialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { Table, TableModule } from '@openng/optimus-ui/table';
import { ToastModule } from '@openng/optimus-ui/toast';
import { CreateNozzleModal } from '../../modals/create-nozzle-modal/create-nozzle-modal';
import { EditNozzleModal } from '../../modals/edit-nozzle-modal/edit-nozzle-modal';
import { NozzleDetailsModal } from '../../modals/nozzle-details-modal/nozzle-details-modal';
import { NozzleOverviewModel } from '../../models/nozzle/nozzle-overview-model';
import { PrinterOverviewModel } from '../../models/printer/printer-overview-model';
import { NozzleHardenedPipe, nozzleHardenedLabel } from '../../pipes/nozzle-hardened-pipe';
import { NozzleTypePipe, nozzleTypeLabel } from '../../pipes/nozzle-type-pipe';
import { ApiNozzleService } from '../../services/api-nozzle-service';
import { ApiPrinterService } from '../../services/api-printer-service';

type NozzleTableRow = NozzleOverviewModel & {
  hardenedLabel: string;
  nozzleTypeLabel: string;
  printerName: string;
};

@Component({
  selector: 'app-nozzles',
  standalone: true,
  imports: [
    ButtonModule,
    ConfirmDialogModule,
    CreateNozzleModal,
    EditNozzleModal,
    InputTextModule,
    NozzleDetailsModal,
    NozzleHardenedPipe,
    NozzleTypePipe,
    TableModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nozzles.html',
})
export class Nozzles implements OnInit {
  @ViewChild(CreateNozzleModal) private createNozzleModal!: CreateNozzleModal;
  @ViewChild(EditNozzleModal) private editNozzleModal!: EditNozzleModal;
  @ViewChild(NozzleDetailsModal) private nozzleDetailsModal!: NozzleDetailsModal;

  public nozzles = signal<NozzleOverviewModel[]>([]);
  public printers = signal<PrinterOverviewModel[]>([]);
  public rows = computed<NozzleTableRow[]>(() => {
    const printerNames = new Map(
      this.printers().map((printer) => [printer.id.toLowerCase(), printer.name]),
    );
    return this.nozzles().map((nozzle) => ({
      ...nozzle,
      hardenedLabel: nozzleHardenedLabel(nozzle.isHardened),
      nozzleTypeLabel: nozzleTypeLabel(nozzle.nozzleType),
      printerName: nozzle.printerId
        ? (printerNames.get(nozzle.printerId.toLowerCase()) ?? 'Unknown printer')
        : 'Unassigned',
    }));
  });

  private readonly nozzleApiService = inject(ApiNozzleService);
  private readonly printerApiService = inject(ApiPrinterService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  public ngOnInit(): void {
    this.loadNozzles();
    this.loadPrinters();
  }

  public loadNozzles(): void {
    this.nozzleApiService.getAllNozzles().subscribe({
      next: (nozzles) => this.nozzles.set(nozzles ?? []),
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Could not load nozzles',
          detail: 'Nozzles could not be loaded. Please try again.',
        });
      },
    });
  }

  public loadPrinters(): void {
    this.printerApiService.getAllPrinters().subscribe({
      next: (printers) => this.printers.set(printers ?? []),
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Could not load printers',
          detail: 'Printer names could not be loaded.',
        });
      },
    });
  }

  public filterNozzles(table: Table, event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      table.filterGlobal(event.target.value, 'contains');
    }
  }

  public showCreateNozzle(): void {
    this.createNozzleModal.show();
  }

  public showNozzleDetails(nozzle: NozzleTableRow): void {
    this.nozzleDetailsModal.show(nozzle, nozzle.printerName);
  }

  public showEditNozzle(nozzleId: string): void {
    this.editNozzleModal.show(nozzleId);
  }

  public confirmDeleteNozzle(nozzle: NozzleOverviewModel): void {
    this.confirmationService.confirm({
      header: 'Delete nozzle',
      message: `Are you sure you want to delete the ${nozzleTypeLabel(nozzle.nozzleType)} ${nozzleHardenedLabel(nozzle.isHardened)} nozzle? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteNozzle(nozzle),
    });
  }

  private deleteNozzle(nozzle: NozzleOverviewModel): void {
    this.nozzleApiService.deleteNozzle(nozzle.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Nozzle deleted',
          detail: 'Nozzle was deleted successfully.',
        });
        this.loadNozzles();
      },
      error: (error: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Could not delete nozzle',
          detail: this.getErrorMessage(error),
        });
      },
    });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    const detail =
      typeof error.error === 'object' && error.error !== null && 'detail' in error.error
        ? error.error.detail
        : null;
    return typeof detail === 'string'
      ? detail
      : 'An error occurred while deleting the nozzle. Please try again.';
  }
}
