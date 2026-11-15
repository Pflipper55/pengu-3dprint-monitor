import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { TableModule } from '@openng/optimus-ui/table';

@Component({
  selector: 'app-filaments',
  standalone: true,
  imports: [ButtonModule, TableModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filaments.html',
})
export class Filaments {}
