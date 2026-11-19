import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { NozzleOverviewModel } from '../models/nozzle/nozzle-overview-model';
import { CreateNozzleRequest } from '../models/nozzle/create-nozzle-request';
import { UpdateNozzleRequest } from '../models/nozzle/update-nozzle-request';

@Service()
export class ApiNozzleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Nozzle`;

  public getAllNozzles(): Observable<NozzleOverviewModel[] | null> {
    return this.http.get<NozzleOverviewModel[] | null>(`${this.apiUrl}/all`);
  }

  public getNozzleById(id: string): Observable<NozzleOverviewModel> {
    return this.http.get<NozzleOverviewModel>(`${this.apiUrl}/${id}`);
  }

  public createNozzle(request: CreateNozzleRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/create`, request);
  }

  public updateNozzle(id: string, request: UpdateNozzleRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/update`, request, { params: { id } });
  }

  public deleteNozzle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete`, { params: { id } });
  }
}
