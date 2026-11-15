import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { TableModule } from '@openng/optimus-ui/table';

@Component({
  selector: 'app-nozzles',
  standalone: true,
  imports: [ButtonModule, TableModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nozzles.html',
})
export class Nozzles {}
