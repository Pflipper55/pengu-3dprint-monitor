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
import { CreateBedRequest } from '../../models/bed/create-bed-request';
import { EBedType } from '../../models/bed/bed-type';
import { PrinterOverviewModel } from '../../models/printer/printer-overview-model';
import { BedTypePipe } from '../../pipes/bed-type-pipe';
import { ApiBedService } from '../../services/api-bed-service';
import { ApiPrinterService } from '../../services/api-printer-service';

@Component({
  selector: 'app-create-bed-modal',
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
  templateUrl: './create-bed-modal.html',
})
export class CreateBedModal {
  @Output() public bedCreated = new EventEmitter<void>();

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

  private readonly bedApiService = inject(ApiBedService);
  private readonly printerApiService = inject(ApiPrinterService);
  private readonly messageService = inject(MessageService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  public show(): void {
    this.visible = true;
    this.loading = true;
    this.form.reset({ brandName: '', bedType: null, printerId: null });
    forkJoin({
      printers: this.printerApiService.getAllPrinters(),
      beds: this.bedApiService.getAllBeds(),
    }).subscribe({
      next: ({ printers, beds }) => {
        const assignedPrinterIds = new Set(
          (beds ?? [])
            .filter((bed) => bed.printerId !== null)
            .map((bed) => bed.printerId!.toLowerCase()),
        );
        this.printers = (printers ?? []).filter(
          (printer) => !assignedPrinterIds.has(printer.id.toLowerCase()),
        );
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: () => this.showLoadError(),
    });
  }

  public hide(): void {
    this.visible = false;
    this.form.reset({ brandName: '', bedType: null, printerId: null });
  }

  public createBed(): void {
    if (this.form.invalid || this.loading || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (value.bedType === null) {
      return;
    }

    const request: CreateBedRequest = {
      brandName: value.brandName.trim(),
      bedType: value.bedType,
      printerId: value.printerId,
    };
    this.submitting = true;
    this.bedApiService.createBed(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Bed added',
          detail: `${request.brandName} was added successfully.`,
        });
        this.hide();
        this.bedCreated.emit();
        this.submitting = false;
        this.changeDetectorRef.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Could not add bed',
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
      summary: 'Could not load bed assignments',
      detail: 'Printers and existing bed assignments could not be loaded.',
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
      : error.status === 409
        ? 'That printer already has a bed assigned.'
        : 'An error occurred while adding the bed. Please try again.';
  }
}
