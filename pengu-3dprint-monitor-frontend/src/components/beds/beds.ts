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
import { BedDetailsModal } from '../../modals/bed-details-modal/bed-details-modal';
import { CreateBedModal } from '../../modals/create-bed-modal/create-bed-modal';
import { EditBedModal } from '../../modals/edit-bed-modal/edit-bed-modal';
import { BedOverviewModel } from '../../models/bed/bed-overview-model';
import { PrinterOverviewModel } from '../../models/printer/printer-overview-model';
import { BedTypePipe, bedTypeLabel } from '../../pipes/bed-type-pipe';
import { ApiBedService } from '../../services/api-bed-service';
import { ApiPrinterService } from '../../services/api-printer-service';

type BedTableRow = BedOverviewModel & {
  bedTypeLabel: string;
  printerName: string;
};

@Component({
  selector: 'app-beds',
  standalone: true,
  imports: [
    BedDetailsModal,
    BedTypePipe,
    ButtonModule,
    ConfirmDialogModule,
    CreateBedModal,
    EditBedModal,
    InputTextModule,
    TableModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './beds.html',
})
export class Beds implements OnInit {
  @ViewChild(CreateBedModal) private createBedModal!: CreateBedModal;
  @ViewChild(EditBedModal) private editBedModal!: EditBedModal;
  @ViewChild(BedDetailsModal) private bedDetailsModal!: BedDetailsModal;

  public beds = signal<BedOverviewModel[]>([]);
  public printers = signal<PrinterOverviewModel[]>([]);
  public rows = computed<BedTableRow[]>(() => {
    const printerNames = new Map(
      this.printers().map((printer) => [printer.id.toLowerCase(), printer.name]),
    );
    return this.beds().map((bed) => ({
      ...bed,
      bedTypeLabel: bedTypeLabel(bed.bedType),
      printerName: bed.printerId
        ? (printerNames.get(bed.printerId.toLowerCase()) ?? 'Unknown printer')
        : 'Unassigned',
    }));
  });

  private readonly bedApiService = inject(ApiBedService);
  private readonly printerApiService = inject(ApiPrinterService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  public ngOnInit(): void {
    this.loadBeds();
    this.loadPrinters();
  }

  public loadBeds(): void {
    this.bedApiService.getAllBeds().subscribe({
      next: (beds) => this.beds.set(beds ?? []),
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Could not load beds',
          detail: 'Beds could not be loaded. Please try again.',
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

  public filterBeds(table: Table, event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      table.filterGlobal(event.target.value, 'contains');
    }
  }

  public showCreateBed(): void {
    this.createBedModal.show();
  }

  public showBedDetails(bed: BedTableRow): void {
    this.bedDetailsModal.show(bed, bed.printerName);
  }

  public showEditBed(bedId: string): void {
    this.editBedModal.show(bedId);
  }

  public confirmDeleteBed(bed: BedOverviewModel): void {
    this.confirmationService.confirm({
      header: 'Delete bed',
      message: `Are you sure you want to delete "${bed.brandName}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteBed(bed),
    });
  }

  private deleteBed(bed: BedOverviewModel): void {
    this.bedApiService.deleteBed(bed.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Bed deleted',
          detail: `${bed.brandName} was deleted successfully.`,
        });
        this.loadBeds();
      },
      error: (error: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Could not delete bed',
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
      : 'An error occurred while deleting the bed. Please try again.';
  }
}
