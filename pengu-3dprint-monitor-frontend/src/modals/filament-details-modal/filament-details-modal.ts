import { Component, signal } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { FilamentOverviewModel } from '../../models/filament/filament-overview-model';
import { FilamentTypePipe } from '../../pipes/filament-type-pipe';

@Component({
  selector: 'app-filament-details-modal',
  standalone: true,
  imports: [ButtonModule, DialogModule, FilamentTypePipe],
  templateUrl: './filament-details-modal.html',
})
export class FilamentDetailsModal {
  public visible = false;
  public filament = signal<FilamentOverviewModel | null>(null);
  public printerName = 'Unassigned';

  public show(filament: FilamentOverviewModel, printerName: string): void {
    this.filament.set(filament);
    this.printerName = printerName;
    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
    this.filament.set(null);
    this.printerName = 'Unassigned';
  }
}
