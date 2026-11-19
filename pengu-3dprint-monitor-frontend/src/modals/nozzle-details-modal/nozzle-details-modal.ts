import { Component, signal } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { NozzleOverviewModel } from '../../models/nozzle/nozzle-overview-model';
import { NozzleTypePipe } from '../../pipes/nozzle-type-pipe';
import { NozzleHardenedPipe } from '../../pipes/nozzle-hardened-pipe';

@Component({
  selector: 'app-nozzle-details-modal',
  standalone: true,
  imports: [ButtonModule, DialogModule, NozzleTypePipe, NozzleHardenedPipe],
  templateUrl: './nozzle-details-modal.html',
})
export class NozzleDetailsModal {
  public visible = false;
  public nozzle = signal<NozzleOverviewModel | null>(null);
  public printerName = 'Unassigned';

  public show(nozzle: NozzleOverviewModel, printerName: string): void {
    this.nozzle.set(nozzle);
    this.printerName = printerName;
    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
    this.nozzle.set(null);
    this.printerName = 'Unassigned';
  }
}
