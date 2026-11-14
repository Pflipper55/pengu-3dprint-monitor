import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DataViewModule } from '@openng/optimus-ui/dataview';

@Component({
  selector: 'app-printers',
  standalone: true,
  imports: [ButtonModule, DataViewModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './printers.html',
})
export class Printers {}
