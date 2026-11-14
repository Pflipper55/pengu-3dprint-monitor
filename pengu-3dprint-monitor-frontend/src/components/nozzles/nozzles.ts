import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DataViewModule } from '@openng/optimus-ui/dataview';

@Component({
  selector: 'app-nozzles',
  standalone: true,
  imports: [ButtonModule, DataViewModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nozzles.html',
})
export class Nozzles {}
