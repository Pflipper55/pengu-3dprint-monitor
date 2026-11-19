import { ChangeDetectorRef, Component, EventEmitter, inject, Output } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from '@openng/optimus-ui/api';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { IftaLabelModule } from '@openng/optimus-ui/iftalabel';
import { InputNumberModule } from '@openng/optimus-ui/inputnumber';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { SelectModule } from '@openng/optimus-ui/select';
import { PrinterOverviewModel } from '../../models/printer/printer-overview-model';
import { CreateFilamentRequest } from '../../models/filament/create-filament-request';
import { EFilamentType } from '../../models/filament/filament-type';
import { FilamentTypePipe } from '../../pipes/filament-type-pipe';
import { ApiFilamentService } from '../../services/api-filament-service';
import { ApiPrinterService } from '../../services/api-printer-service';

@Component({
  selector: 'app-create-filament-modal',
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
  templateUrl: './create-filament-modal.html',
})
export class CreateFilamentModal {
  @Output() public filamentCreated = new EventEmitter<void>();

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

  private readonly filamentApiService = inject(ApiFilamentService);
  private readonly printerApiService = inject(ApiPrinterService);
  private readonly messageService = inject(MessageService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  public show(): void {
    this.visible = true;
    this.loading = true;
    this.form.reset({
      brandName: '',
      filamentType: null,
      weight: null,
      colorCode: '#FFFFFF',
      printerId: null,
    });
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
    this.form.reset({
      brandName: '',
      filamentType: null,
      weight: null,
      colorCode: '#FFFFFF',
      printerId: null,
    });
  }

  public createFilament(): void {
    if (this.form.invalid || this.loading || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (value.filamentType === null || value.weight === null) {
      return;
    }

    const request: CreateFilamentRequest = {
      brandName: value.brandName.trim(),
      filamentType: value.filamentType,
      weight: value.weight,
      colorCode: value.colorCode.trim(),
      printerId: value.printerId,
    };

    this.submitting = true;
    this.filamentApiService.createFilament(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Filament added',
          detail: `${request.brandName} was added successfully.`,
        });
        this.hide();
        this.filamentCreated.emit();
        this.submitting = false;
        this.changeDetectorRef.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Could not add filament',
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
      : 'An error occurred while adding the filament. Please try again.';
  }
}
