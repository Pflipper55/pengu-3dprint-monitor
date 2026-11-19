import { ChangeDetectorRef, Component, EventEmitter, inject, Output } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MessageService } from '@openng/optimus-ui/api';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { IftaLabelModule } from '@openng/optimus-ui/iftalabel';
import { SelectModule } from '@openng/optimus-ui/select';
import { PrinterOverviewModel } from '../../models/printer/printer-overview-model';
import { ENozzleType } from '../../models/nozzle/nozzle-type';
import { UpdateNozzleRequest } from '../../models/nozzle/update-nozzle-request';
import { NozzleTypePipe } from '../../pipes/nozzle-type-pipe';
import { NozzleHardenedPipe } from '../../pipes/nozzle-hardened-pipe';
import { ApiNozzleService } from '../../services/api-nozzle-service';
import { ApiPrinterService } from '../../services/api-printer-service';

@Component({
  selector: 'app-edit-nozzle-modal',
  standalone: true,
  imports: [
    ButtonModule,
    DialogModule,
    IftaLabelModule,
    ReactiveFormsModule,
    SelectModule,
    NozzleTypePipe,
    NozzleHardenedPipe,
  ],
  templateUrl: './edit-nozzle-modal.html',
})
export class EditNozzleModal {
  @Output() public nozzleUpdated = new EventEmitter<void>();

  public visible = false;
  public loading = false;
  public submitting = false;
  public printers: PrinterOverviewModel[] = [];
  public readonly nozzleTypes = Object.values(ENozzleType).filter(
    (value): value is ENozzleType => typeof value === 'number' && value !== ENozzleType.NONE,
  );
  public readonly hardenedOptions = [true, false];
  public readonly form = new FormGroup({
    nozzleType: new FormControl<ENozzleType | null>(null, Validators.required),
    isHardened: new FormControl<boolean | null>(null, Validators.required),
    printerId: new FormControl<string | null>(null),
  });

  private nozzleId: string | null = null;
  private readonly nozzleApiService = inject(ApiNozzleService);
  private readonly printerApiService = inject(ApiPrinterService);
  private readonly messageService = inject(MessageService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  public show(nozzleId: string): void {
    this.nozzleId = nozzleId;
    this.visible = true;
    this.loading = true;
    this.form.disable();
    forkJoin({
      nozzle: this.nozzleApiService.getNozzleById(nozzleId),
      printers: this.printerApiService.getAllPrinters(),
    }).subscribe({
      next: ({ nozzle, printers }) => {
        this.printers = printers ?? [];
        this.form.reset({
          nozzleType: nozzle.nozzleType,
          isHardened: nozzle.isHardened,
          printerId: nozzle.printerId,
        });
        this.form.enable();
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.visible = false;
        this.loading = false;
        this.form.enable();
        this.messageService.add({
          severity: 'error',
          summary: 'Could not load nozzle',
          detail: 'Nozzle details or printer assignments could not be loaded.',
        });
        this.changeDetectorRef.markForCheck();
      },
    });
  }

  public hide(): void {
    this.visible = false;
    this.nozzleId = null;
    this.form.reset({ nozzleType: null, isHardened: null, printerId: null });
  }

  public updateNozzle(): void {
    if (this.form.invalid || this.loading || this.submitting || this.nozzleId === null) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (value.nozzleType === null || value.isHardened === null) {
      return;
    }

    const request: UpdateNozzleRequest = {
      nozzleType: value.nozzleType,
      isHardened: value.isHardened,
      printerId: value.printerId,
    };
    this.submitting = true;
    this.nozzleApiService.updateNozzle(this.nozzleId, request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Nozzle updated',
          detail: 'Nozzle changes were saved.',
        });
        this.hide();
        this.nozzleUpdated.emit();
        this.submitting = false;
        this.changeDetectorRef.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Could not update nozzle',
          detail: this.getErrorMessage(error),
        });
        this.submitting = false;
        this.changeDetectorRef.markForCheck();
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
      : 'An error occurred while updating the nozzle. Please try again.';
  }
}
