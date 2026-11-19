import { ChangeDetectorRef, Component, EventEmitter, inject, Output } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MessageService } from '@openng/optimus-ui/api';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { IftaLabelModule } from '@openng/optimus-ui/iftalabel';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { SelectModule } from '@openng/optimus-ui/select';
import { BedOverviewModel } from '../../models/bed/bed-overview-model';
import { EBedType } from '../../models/bed/bed-type';
import { UpdateBedRequest } from '../../models/bed/update-bed-request';
import { PrinterOverviewModel } from '../../models/printer/printer-overview-model';
import { BedTypePipe } from '../../pipes/bed-type-pipe';
import { ApiBedService } from '../../services/api-bed-service';
import { ApiPrinterService } from '../../services/api-printer-service';

@Component({
  selector: 'app-edit-bed-modal',
  standalone: true,
  imports: [
    ButtonModule,
    DialogModule,
    IftaLabelModule,
    InputTextModule,
    ReactiveFormsModule,
    SelectModule,
    BedTypePipe,
  ],
  templateUrl: './edit-bed-modal.html',
})
export class EditBedModal {
  @Output() public bedUpdated = new EventEmitter<void>();

  public visible = false;
  public loading = false;
  public submitting = false;
  public printers: PrinterOverviewModel[] = [];
  public readonly bedTypes = Object.values(EBedType).filter(
    (value): value is EBedType => typeof value === 'number' && value !== EBedType.NONE,
  );
  public readonly form = new FormGroup({
    brandName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    bedType: new FormControl<EBedType | null>(null, Validators.required),
    printerId: new FormControl<string | null>(null),
  });

  private bedId: string | null = null;
  private readonly bedApiService = inject(ApiBedService);
  private readonly printerApiService = inject(ApiPrinterService);
  private readonly messageService = inject(MessageService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  public show(bedId: string): void {
    this.bedId = bedId;
    this.visible = true;
    this.loading = true;
    this.form.disable();
    forkJoin({
      bed: this.bedApiService.getBedById(bedId),
      printers: this.printerApiService.getAllPrinters(),
      beds: this.bedApiService.getAllBeds(),
    }).subscribe({
      next: ({ bed, printers, beds }) => {
        const assignedPrinterIds = new Set(
          (beds ?? [])
            .filter(
              (item) => item.printerId !== null && item.id.toLowerCase() !== bedId.toLowerCase(),
            )
            .map((item) => item.printerId!.toLowerCase()),
        );
        this.printers = (printers ?? []).filter(
          (printer) =>
            !assignedPrinterIds.has(printer.id.toLowerCase()) ||
            printer.id.toLowerCase() === bed.printerId?.toLowerCase(),
        );
        this.form.reset({
          brandName: bed.brandName,
          bedType: bed.bedType,
          printerId: bed.printerId,
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
          summary: 'Could not load bed',
          detail: 'Bed details or printer assignments could not be loaded.',
        });
        this.changeDetectorRef.markForCheck();
      },
    });
  }

  public hide(): void {
    this.visible = false;
    this.bedId = null;
    this.form.reset({ brandName: '', bedType: null, printerId: null });
  }

  public updateBed(): void {
    if (this.form.invalid || this.loading || this.submitting || this.bedId === null) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (value.bedType === null) {
      return;
    }

    const request: UpdateBedRequest = {
      brandName: value.brandName.trim(),
      bedType: value.bedType,
      printerId: value.printerId,
    };
    this.submitting = true;
    this.bedApiService.updateBed(this.bedId, request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Bed updated',
          detail: `${request.brandName} was updated successfully.`,
        });
        this.hide();
        this.bedUpdated.emit();
        this.submitting = false;
        this.changeDetectorRef.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Could not update bed',
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
      : error.status === 409
        ? 'That printer already has a bed assigned.'
        : 'An error occurred while updating the bed. Please try again.';
  }
}
