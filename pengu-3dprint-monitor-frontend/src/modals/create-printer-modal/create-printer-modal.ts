import { ChangeDetectorRef, Component, EventEmitter, inject, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { MessageService } from '@openng/optimus-ui/api';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { IftaLabelModule } from '@openng/optimus-ui/iftalabel';
import { InputNumberModule } from '@openng/optimus-ui/inputnumber';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { MultiSelectModule } from '@openng/optimus-ui/multiselect';
import { SelectModule } from '@openng/optimus-ui/select';
import { BedOverviewModel } from '../../models/bed/bed-overview-model';
import { FilamentOverviewModel } from '../../models/filament/filament-overview-model';
import { NozzleOverviewModel } from '../../models/nozzle/nozzle-overview-model';
import { CreatePrinterRequest } from '../../models/printer/create-printer-request';
import { EPrinterType } from '../../models/printer/printer-type';
import { ApiBedService } from '../../services/api-bed-service';
import { ApiFilamentService } from '../../services/api-filament-service';
import { ApiNozzleService } from '../../services/api-nozzle-service';
import { ApiPrinterService } from '../../services/api-printer-service';
import { PrinterTypePipe } from '../../pipes/printer-type-pipe';
import { BedTypePipe } from '../../pipes/bed-type-pipe';
import { NozzleTypePipe } from '../../pipes/nozzle-type-pipe';
import { NozzleHardenedPipe } from '../../pipes/nozzle-hardened-pipe';
import { FilamentTypePipe } from '../../pipes/filament-type-pipe';

@Component({
  selector: 'app-create-printer-modal',
  standalone: true,
  imports: [
    ButtonModule,
    DialogModule,
    IftaLabelModule,
    InputNumberModule,
    InputTextModule,
    MultiSelectModule,
    ReactiveFormsModule,
    SelectModule,
    PrinterTypePipe,
    BedTypePipe,
    NozzleTypePipe,
    NozzleHardenedPipe,
    FilamentTypePipe,
  ],
  templateUrl: './create-printer-modal.html',
})
export class CreatePrinterModal {
  @Output() public printerCreated = new EventEmitter<void>();

  public visible = false;
  public submitting = false;
  public loadingInventory = false;
  public availableBeds: BedOverviewModel[] = [];
  public availableNozzles: NozzleOverviewModel[] = [];
  public availableFilaments: FilamentOverviewModel[] = [];
  public readonly printerTypes = Object.values(EPrinterType).filter(
    (value): value is EPrinterType => typeof value === 'number' && value !== EPrinterType.NONE,
  );

  public readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    printerType: new FormControl<EPrinterType | null>(null, Validators.required),
    ip: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    accessCode: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    serialNumber: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    firmwareVersion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    printingHours: new FormControl<number | null>(null, Validators.min(0)),
    bedId: new FormControl<string | null>(null),
    nozzles: new FormControl<NozzleOverviewModel[]>([], { nonNullable: true }),
    filaments: new FormControl<FilamentOverviewModel[]>([], { nonNullable: true }),
  });

  private readonly printerApiService = inject(ApiPrinterService);
  private readonly bedApiService = inject(ApiBedService);
  private readonly nozzleApiService = inject(ApiNozzleService);
  private readonly filamentApiService = inject(ApiFilamentService);
  private readonly messageService = inject(MessageService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  public show(): void {
    this.visible = true;
    this.loadInventory();
    this.changeDetectorRef.markForCheck();
  }

  public hide(): void {
    this.visible = false;
    this.form.reset({
      name: '',
      printerType: null,
      ip: '',
      accessCode: '',
      serialNumber: '',
      firmwareVersion: '',
      printingHours: null,
      bedId: null,
      nozzles: [],
      filaments: [],
    });
  }

  private loadInventory(): void {
    this.loadingInventory = true;
    this.availableBeds = [];
    this.availableNozzles = [];
    this.availableFilaments = [];

    forkJoin({
      beds: this.bedApiService.getAllBeds(),
      nozzles: this.nozzleApiService.getAllNozzles(),
      filaments: this.filamentApiService.getAllFilaments(),
    }).subscribe({
      next: ({ beds, nozzles, filaments }) => {
        this.availableBeds = (beds ?? []).filter((bed) => bed.printerId === null);
        this.availableNozzles = (nozzles ?? []).filter((nozzle) => nozzle.printerId === null);
        this.availableFilaments = (filaments ?? []).filter(
          (filament) => filament.printerId === null,
        );
        this.loadingInventory = false;
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.loadingInventory = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Could not load printer accessories',
          detail: 'Beds, nozzles, and filaments could not be loaded. Please try again.',
        });
        this.changeDetectorRef.markForCheck();
      },
    });
  }

  public createPrinter(): void {
    if (this.form.invalid || this.submitting || this.loadingInventory) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    if (formValue.printerType === null) {
      return;
    }

    const request: CreatePrinterRequest = {
      name: formValue.name.trim(),
      printerType: formValue.printerType,
      ip: formValue.ip.trim(),
      accessCode: formValue.accessCode.trim(),
      serialNumber: formValue.serialNumber.trim(),
      firmwareVersion: formValue.firmwareVersion.trim(),
      printingHours: formValue.printingHours,
      bedId: formValue.bedId,
      nozzleIds: formValue.nozzles.map((nozzle) => nozzle.id),
      filamentIds: formValue.filaments.map((filament) => filament.id),
    };

    this.submitting = true;
    this.printerApiService.createPrinter(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Printer added',
          detail: `${request.name} was added successfully.`,
        });
        this.hide();
        this.printerCreated.emit();
        this.submitting = false;
      },
      error: (error: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Could not add printer',
          detail: this.getCreateErrorMessage(error),
        });
        this.submitting = false;
      },
    });
  }

  private getCreateErrorMessage(error: HttpErrorResponse): string {
    const detail =
      typeof error.error === 'object' && error.error !== null && 'detail' in error.error
        ? error.error.detail
        : null;

    if (typeof detail === 'string') {
      return detail;
    }

    if (error.status === 409) {
      return 'A printer or selected accessory is already assigned.';
    }

    if (error.status === 400) {
      return 'The printer or one of the selected accessories is invalid.';
    }

    return 'An error occurred while adding the printer. Please try again.';
  }
}
