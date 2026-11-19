import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { BedOverviewModel } from '../models/bed/bed-overview-model';

@Service()
export class ApiBedService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Bed`;

  public getAllBeds(): Observable<BedOverviewModel[] | null> {
    return this.http.get<BedOverviewModel[] | null>(`${this.apiUrl}/all`);
  }
}
