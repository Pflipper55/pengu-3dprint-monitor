import { Component, signal } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { BedOverviewModel } from '../../models/bed/bed-overview-model';
import { BedTypePipe } from '../../pipes/bed-type-pipe';

@Component({
  selector: 'app-bed-details-modal',
  standalone: true,
  imports: [ButtonModule, DialogModule, BedTypePipe],
  templateUrl: './bed-details-modal.html',
})
export class BedDetailsModal {
  public visible = false;
  public bed = signal<BedOverviewModel | null>(null);
  public printerName = 'Unassigned';

  public show(bed: BedOverviewModel, printerName: string): void {
    this.bed.set(bed);
    this.printerName = printerName;
    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
    this.bed.set(null);
    this.printerName = 'Unassigned';
  }
}
