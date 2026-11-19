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
import { CreateFilamentModal } from '../../modals/create-filament-modal/create-filament-modal';
import { EditFilamentModal } from '../../modals/edit-filament-modal/edit-filament-modal';
import { FilamentDetailsModal } from '../../modals/filament-details-modal/filament-details-modal';
import { FilamentOverviewModel } from '../../models/filament/filament-overview-model';
import { PrinterOverviewModel } from '../../models/printer/printer-overview-model';
import { FilamentTypePipe, filamentTypeLabel } from '../../pipes/filament-type-pipe';
import { ApiFilamentService } from '../../services/api-filament-service';
import { ApiPrinterService } from '../../services/api-printer-service';

type FilamentTableRow = FilamentOverviewModel & {
  filamentTypeLabel: string;
  printerName: string;
};

@Component({
  selector: 'app-filaments',
  standalone: true,
  imports: [
    ButtonModule,
    ConfirmDialogModule,
    CreateFilamentModal,
    EditFilamentModal,
    FilamentDetailsModal,
    FilamentTypePipe,
    InputTextModule,
    TableModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filaments.html',
})
export class Filaments implements OnInit {
  @ViewChild(CreateFilamentModal) private createFilamentModal!: CreateFilamentModal;
  @ViewChild(EditFilamentModal) private editFilamentModal!: EditFilamentModal;
  @ViewChild(FilamentDetailsModal) private filamentDetailsModal!: FilamentDetailsModal;

  public filaments = signal<FilamentOverviewModel[]>([]);
  public printers = signal<PrinterOverviewModel[]>([]);
  public rows = computed<FilamentTableRow[]>(() => {
    const printerNames = new Map(
      this.printers().map((printer) => [printer.id.toLowerCase(), printer.name]),
    );
    return this.filaments().map((filament) => ({
      ...filament,
      filamentTypeLabel: filamentTypeLabel(filament.filamentType),
      printerName: filament.printerId
        ? (printerNames.get(filament.printerId.toLowerCase()) ?? 'Unknown printer')
        : 'Unassigned',
    }));
  });

  private readonly filamentApiService = inject(ApiFilamentService);
  private readonly printerApiService = inject(ApiPrinterService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  public ngOnInit(): void {
    this.loadFilaments();
    this.loadPrinters();
  }

  public loadFilaments(): void {
    this.filamentApiService.getAllFilaments().subscribe({
      next: (filaments) => this.filaments.set(filaments ?? []),
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Could not load filaments',
          detail: 'Filaments could not be loaded. Please try again.',
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

  public filterFilaments(table: Table, event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      table.filterGlobal(event.target.value, 'contains');
    }
  }

  public showCreateFilament(): void {
    this.createFilamentModal.show();
  }

  public showFilamentDetails(filament: FilamentTableRow): void {
    this.filamentDetailsModal.show(filament, filament.printerName);
  }

  public showEditFilament(filamentId: string): void {
    this.editFilamentModal.show(filamentId);
  }

  public confirmDeleteFilament(filament: FilamentOverviewModel): void {
    this.confirmationService.confirm({
      header: 'Delete filament',
      message: `Are you sure you want to delete "${filament.brandName}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteFilament(filament),
    });
  }

  private deleteFilament(filament: FilamentOverviewModel): void {
    this.filamentApiService.deleteFilament(filament.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Filament deleted',
          detail: `${filament.brandName} was deleted successfully.`,
        });
        this.loadFilaments();
      },
      error: (error: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Could not delete filament',
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
      : 'An error occurred while deleting the filament. Please try again.';
  }
}
