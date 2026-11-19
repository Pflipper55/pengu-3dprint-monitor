import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { FilamentOverviewModel } from '../models/filament/filament-overview-model';
import { CreateFilamentRequest } from '../models/filament/create-filament-request';
import { UpdateFilamentRequest } from '../models/filament/update-filament-request';

@Service()
export class ApiFilamentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Filament`;

  public getAllFilaments(): Observable<FilamentOverviewModel[] | null> {
    return this.http.get<FilamentOverviewModel[] | null>(`${this.apiUrl}/all`);
  }

  public getFilamentById(id: string): Observable<FilamentOverviewModel> {
    return this.http.get<FilamentOverviewModel>(`${this.apiUrl}/${id}`);
  }

  public createFilament(request: CreateFilamentRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/create`, request);
  }

  public updateFilament(id: string, request: UpdateFilamentRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/update`, request, { params: { id } });
  }

  public deleteFilament(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete`, { params: { id } });
  }
}
