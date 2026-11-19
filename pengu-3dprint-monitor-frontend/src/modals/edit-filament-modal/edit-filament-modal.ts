import { ChangeDetectorRef, Component, EventEmitter, inject, Output } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MessageService } from '@openng/optimus-ui/api';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { IftaLabelModule } from '@openng/optimus-ui/iftalabel';
import { InputNumberModule } from '@openng/optimus-ui/inputnumber';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { SelectModule } from '@openng/optimus-ui/select';
import { PrinterOverviewModel } from '../../models/printer/printer-overview-model';
import { EFilamentType } from '../../models/filament/filament-type';
import { UpdateFilamentRequest } from '../../models/filament/update-filament-request';
import { FilamentTypePipe } from '../../pipes/filament-type-pipe';
import { ApiFilamentService } from '../../services/api-filament-service';
import { ApiPrinterService } from '../../services/api-printer-service';

@Component({
  selector: 'app-edit-filament-modal',
  standalone: true,
  imports: [
    ButtonModule,
    DialogModule,
    IftaLabelModule,
    InputNumberModule,
    InputTextModule,
    ReactiveFormsModule,
    SelectModule,
    FilamentTypePipe,
  ],
  templateUrl: './edit-filament-modal.html',
})
export class EditFilamentModal {
  @Output() public filamentUpdated = new EventEmitter<void>();

  public visible = false;
  public loading = false;
  public submitting = false;
  public printers: PrinterOverviewModel[] = [];
  public readonly filamentTypes = Object.values(EFilamentType).filter(
    (value): value is EFilamentType => typeof value === 'number' && value !== EFilamentType.NONE,
  );
  public readonly form = new FormGroup({
    brandName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    filamentType: new FormControl<EFilamentType | null>(null, Validators.required),
    weight: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    colorCode: new FormControl('#FFFFFF', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)],
    }),
    printerId: new FormControl<string | null>(null),
  });

  private filamentId: string | null = null;
  private readonly filamentApiService = inject(ApiFilamentService);
  private readonly printerApiService = inject(ApiPrinterService);
  private readonly messageService = inject(MessageService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  public show(filamentId: string): void {
    this.filamentId = filamentId;
    this.visible = true;
    this.loading = true;
    this.form.disable();
    forkJoin({
      filament: this.filamentApiService.getFilamentById(filamentId),
      printers: this.printerApiService.getAllPrinters(),
    }).subscribe({
      next: ({ filament, printers }) => {
        this.printers = printers ?? [];
        this.form.reset({
          brandName: filament.brandName,
          filamentType: filament.filamentType,
          weight: filament.weight,
          colorCode: filament.colorCode,
          printerId: filament.printerId,
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
          summary: 'Could not load filament',
          detail: 'Filament details or printer assignments could not be loaded.',
        });
        this.changeDetectorRef.markForCheck();
      },
    });
  }

  public hide(): void {
    this.visible = false;
    this.filamentId = null;
    this.form.reset({
      brandName: '',
      filamentType: null,
      weight: null,
      colorCode: '#FFFFFF',
      printerId: null,
    });
  }

  public updateFilament(): void {
    if (this.form.invalid || this.loading || this.submitting || this.filamentId === null) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (value.filamentType === null || value.weight === null) {
      return;
    }

    const request: UpdateFilamentRequest = {
      brandName: value.brandName.trim(),
      filamentType: value.filamentType,
      weight: value.weight,
      colorCode: value.colorCode.trim(),
      printerId: value.printerId,
    };
    this.submitting = true;
    this.filamentApiService.updateFilament(this.filamentId, request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Filament updated',
          detail: `${request.brandName} was updated successfully.`,
        });
        this.hide();
        this.filamentUpdated.emit();
        this.submitting = false;
        this.changeDetectorRef.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Could not update filament',
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
      : 'An error occurred while updating the filament. Please try again.';
  }
}
