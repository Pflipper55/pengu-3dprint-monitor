import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { ApiPrinterService } from '../../services/api-printer-service';
import { PrinterDetailsModel } from '../../models/printer/printer-details-model';
import { EPrinterType } from '../../models/printer/printer-type';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { ButtonModule } from '@openng/optimus-ui/button';
import { PrinterSvgPipe } from '../../pipes/printer-svg-pipe';
import { PrinterTypePipe } from '../../pipes/printer-type-pipe';
import { NozzleTypePipe } from '../../pipes/nozzle-type-pipe';
import { NozzleHardenedPipe } from '../../pipes/nozzle-hardened-pipe';
import { FilamentTypePipe } from '../../pipes/filament-type-pipe';

@Component({
  imports: [
    DialogModule,
    ButtonModule,
    PrinterSvgPipe,
    PrinterTypePipe,
    NozzleTypePipe,
    NozzleHardenedPipe,
    FilamentTypePipe,
  ],
  selector: 'app-printer-details-modal',
  templateUrl: './printer-details-modal.html',
  standalone: true,
})
export class PrinterDetailsModal implements OnDestroy {
  public visible = false;

  public printerDetails = signal<PrinterDetailsModel>({
    accessCode: '',
    firmwareVersion: '',
    id: '',
    ip: '',
    loadedFilaments: [],
    name: '',
    nozzles: [],
    printerType: EPrinterType.NONE,
    printingHours: 0,
    usedBed: null,
  });
  private printerApiService = inject(ApiPrinterService);
  private changeDetectorRef = inject(ChangeDetectorRef);

  ngOnDestroy(): void {
    this.hide();
  }

  public show(printerId: string): void {
    this.printerApiService.getPrinterById(printerId).subscribe((data) => {
      this.printerDetails.set(data);
      this.visible = true;
      this.changeDetectorRef.markForCheck();
    });
  }

  public hide(): void {
    this.visible = false;
    this.printerDetails.set({
      accessCode: '',
      firmwareVersion: '',
      id: '',
      ip: '',
      loadedFilaments: [],
      name: '',
      nozzles: [],
      printerType: EPrinterType.NONE,
      printingHours: 0,
      usedBed: null,
    });
  }
}
