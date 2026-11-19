import { ChangeDetectorRef, Component, EventEmitter, inject, Output } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from '@openng/optimus-ui/api';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { IftaLabelModule } from '@openng/optimus-ui/iftalabel';
import { SelectModule } from '@openng/optimus-ui/select';
import { PrinterOverviewModel } from '../../models/printer/printer-overview-model';
import { CreateNozzleRequest } from '../../models/nozzle/create-nozzle-request';
import { ENozzleType } from '../../models/nozzle/nozzle-type';
import { NozzleTypePipe } from '../../pipes/nozzle-type-pipe';
import { NozzleHardenedPipe } from '../../pipes/nozzle-hardened-pipe';
import { ApiNozzleService } from '../../services/api-nozzle-service';
import { ApiPrinterService } from '../../services/api-printer-service';

@Component({
  selector: 'app-create-nozzle-modal',
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
  templateUrl: './create-nozzle-modal.html',
})
export class CreateNozzleModal {
  @Output() public nozzleCreated = new EventEmitter<void>();

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

  private readonly nozzleApiService = inject(ApiNozzleService);
  private readonly printerApiService = inject(ApiPrinterService);
  private readonly messageService = inject(MessageService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  public show(): void {
    this.visible = true;
    this.loading = true;
    this.form.reset({ nozzleType: null, isHardened: null, printerId: null });
    this.printerApiService.getAllPrinters().subscribe({
      next: (printers) => {
        this.printers = printers ?? [];
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: () => this.showLoadError(),
    });
  }

  public hide(): void {
    this.visible = false;
    this.form.reset({ nozzleType: null, isHardened: null, printerId: null });
  }

  public createNozzle(): void {
    if (this.form.invalid || this.loading || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (value.nozzleType === null || value.isHardened === null) {
      return;
    }

    const request: CreateNozzleRequest = {
      nozzleType: value.nozzleType,
      isHardened: value.isHardened,
      printerId: value.printerId,
    };

    this.submitting = true;
    this.nozzleApiService.createNozzle(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Nozzle added',
          detail: 'Nozzle was added successfully.',
        });
        this.hide();
        this.nozzleCreated.emit();
        this.submitting = false;
        this.changeDetectorRef.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Could not add nozzle',
          detail: this.getErrorMessage(error),
        });
        this.submitting = false;
        this.changeDetectorRef.markForCheck();
      },
    });
  }

  private showLoadError(): void {
    this.loading = false;
    this.messageService.add({
      severity: 'error',
      summary: 'Could not load printers',
      detail: 'Printer assignments could not be loaded. Please try again.',
    });
    this.changeDetectorRef.markForCheck();
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    const detail =
      typeof error.error === 'object' && error.error !== null && 'detail' in error.error
        ? error.error.detail
        : null;
    return typeof detail === 'string'
      ? detail
      : 'An error occurred while adding the nozzle. Please try again.';
  }
}
