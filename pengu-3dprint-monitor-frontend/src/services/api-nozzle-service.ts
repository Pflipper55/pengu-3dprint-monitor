import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { NozzleOverviewModel } from '../models/nozzle/nozzle-overview-model';

@Service()
export class ApiNozzleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Nozzle`;

  public getAllNozzles(): Observable<NozzleOverviewModel[] | null> {
    return this.http.get<NozzleOverviewModel[] | null>(`${this.apiUrl}/all`);
  }
}
