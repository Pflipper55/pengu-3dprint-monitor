import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { BedOverviewModel } from '../models/bed/bed-overview-model';
import { CreateBedRequest } from '../models/bed/create-bed-request';
import { UpdateBedRequest } from '../models/bed/update-bed-request';

@Service()
export class ApiBedService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Bed`;

  public getAllBeds(): Observable<BedOverviewModel[] | null> {
    return this.http.get<BedOverviewModel[] | null>(`${this.apiUrl}/all`);
  }

  public getBedById(id: string): Observable<BedOverviewModel> {
    return this.http.get<BedOverviewModel>(`${this.apiUrl}/${id}`);
  }

  public createBed(request: CreateBedRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/create`, request);
  }

  public updateBed(id: string, request: UpdateBedRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/update`, request, { params: { id } });
  }

  public deleteBed(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete`, { params: { id } });
  }
}
