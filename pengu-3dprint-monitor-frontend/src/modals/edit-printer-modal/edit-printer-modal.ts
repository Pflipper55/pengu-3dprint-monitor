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
import { MultiSelectModule } from '@openng/optimus-ui/multiselect';
import { SelectModule } from '@openng/optimus-ui/select';
import { BedOverviewModel } from '../../models/bed/bed-overview-model';
import { FilamentOverviewModel } from '../../models/filament/filament-overview-model';
import { NozzleOverviewModel } from '../../models/nozzle/nozzle-overview-model';
import { EPrinterType } from '../../models/printer/printer-type';
import { UpdatePrinterRequest } from '../../models/printer/update-printer-request';
import { BedTypePipe } from '../../pipes/bed-type-pipe';
import { PrinterTypePipe } from '../../pipes/printer-type-pipe';
import { FilamentTypePipe } from '../../pipes/filament-type-pipe';
import { NozzleHardenedPipe } from '../../pipes/nozzle-hardened-pipe';
import { NozzleTypePipe } from '../../pipes/nozzle-type-pipe';
import { ApiBedService } from '../../services/api-bed-service';
import { ApiFilamentService } from '../../services/api-filament-service';
import { ApiNozzleService } from '../../services/api-nozzle-service';
import { ApiPrinterService } from '../../services/api-printer-service';

@Component({
  selector: 'app-edit-printer-modal',
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
    BedTypePipe,
    FilamentTypePipe,
    NozzleHardenedPipe,
    NozzleTypePipe,
    PrinterTypePipe,
  ],
  templateUrl: './edit-printer-modal.html',
})
export class EditPrinterModal {
  @Output() public printerUpdated = new EventEmitter<void>();

  public visible = false;
  public loading = false;
  public submitting = false;
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

  private printerId: string | null = null;
  private readonly printerApiService = inject(ApiPrinterService);
  private readonly bedApiService = inject(ApiBedService);
  private readonly nozzleApiService = inject(ApiNozzleService);
  private readonly filamentApiService = inject(ApiFilamentService);
  private readonly messageService = inject(MessageService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  public show(printerId: string): void {
    this.printerId = printerId;
    this.visible = true;
    this.loading = true;
    this.form.disable();

    forkJoin({
      printer: this.printerApiService.getPrinterById(printerId),
      beds: this.bedApiService.getAllBeds(),
      nozzles: this.nozzleApiService.getAllNozzles(),
      filaments: this.filamentApiService.getAllFilaments(),
    }).subscribe({
      next: ({ printer, beds, nozzles, filaments }) => {
        this.availableBeds = (beds ?? []).filter(
          (bed) =>
            bed.printerId === null || bed.printerId.toLowerCase() === printerId.toLowerCase(),
        );
        this.availableNozzles = (nozzles ?? []).filter(
          (nozzle) =>
            nozzle.printerId === null || nozzle.printerId.toLowerCase() === printerId.toLowerCase(),
        );
        this.availableFilaments = (filaments ?? []).filter(
          (filament) =>
            filament.printerId === null ||
            filament.printerId.toLowerCase() === printerId.toLowerCase(),
        );
        this.form.reset({
          name: printer.name,
          printerType: printer.printerType,
          ip: printer.ip,
          accessCode: printer.accessCode,
          serialNumber: printer.serialNumber,
          firmwareVersion: printer.firmwareVersion,
          printingHours: printer.printingHours,
          bedId: printer.usedBed?.id ?? null,
          nozzles: printer.nozzles,
          filaments: printer.loadedFilaments,
        });
        this.form.enable();
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.visible = false;
        this.form.enable();
        this.messageService.add({
          severity: 'error',
          summary: 'Could not load printer',
          detail: 'The printer details or available beds could not be loaded.',
        });
        this.changeDetectorRef.markForCheck();
      },
    });
  }

  public hide(): void {
    this.visible = false;
    this.printerId = null;
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

  public updatePrinter(): void {
    if (this.form.invalid || this.submitting || this.loading || this.printerId === null) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    if (formValue.printerType === null) {
      return;
    }

    const request: UpdatePrinterRequest = {
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
    this.printerApiService.updatePrinter(this.printerId, request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Printer updated',
          detail: `${request.name} was updated successfully.`,
        });
        this.hide();
        this.printerUpdated.emit();
        this.submitting = false;
        this.changeDetectorRef.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Could not update printer',
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

    if (typeof detail === 'string') {
      return detail;
    }

    if (error.status === 409) {
      return 'A printer with this name or IP address already exists, or the selected bed is assigned elsewhere.';
    }

    if (error.status === 400) {
      return 'The printer details or selected bed are invalid.';
    }

    return 'An error occurred while updating the printer. Please try again.';
  }
}
