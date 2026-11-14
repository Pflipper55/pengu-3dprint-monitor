import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CreatePrinterRequest } from '../models/printer/create-printer-request';
import { PrinterDetailsModel } from '../models/printer/printer-details-model';
import { PrinterOverviewModel } from '../models/printer/printer-overview-model';
import { UpdatePrinterRequest } from '../models/printer/update-printer-request';

@Service()
export class ApiPrinterService {
  constructor() {}
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/Printer';

  public getAllPrinters(): Observable<PrinterOverviewModel[] | null> {
    return this.http.get<PrinterOverviewModel[] | null>(this.apiUrl + '/all');
  }

  public getPrinterById(id: string): Observable<PrinterDetailsModel> {
    return this.http.get<PrinterDetailsModel>(`${this.apiUrl}/${id}`);
  }

  public createPrinter(request: CreatePrinterRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl + '/create', request);
  }

  public updatePrinter(id: string, request: UpdatePrinterRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl + '/update', request, { params: { id } });
  }

  public deletePrinter(id: string): Observable<void> {
    return this.http.delete<void>(this.apiUrl + '/delete', { params: { id } });
  }
}
