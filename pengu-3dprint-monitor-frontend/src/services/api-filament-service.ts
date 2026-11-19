import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { FilamentOverviewModel } from '../models/filament/filament-overview-model';

@Service()
export class ApiFilamentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Filament`;

  public getAllFilaments(): Observable<FilamentOverviewModel[] | null> {
    return this.http.get<FilamentOverviewModel[] | null>(`${this.apiUrl}/all`);
  }
}
