// src/app/core/services/facture-fournisseur.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FactureFournisseur, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class FactureFournisseurService {
  private apiUrl = `${environment.apiUrl}/factures-fournisseurs`;

  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<PaginatedResponse<FactureFournisseur>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.append(key, params[key]);
      });
    }
    return this.http.get<PaginatedResponse<FactureFournisseur>>(this.apiUrl, { params: httpParams });
  }

  getById(id: number): Observable<FactureFournisseur> {
    return this.http.get<FactureFournisseur>(`${this.apiUrl}/${id}`);
  }

  impayees(): Observable<FactureFournisseur[]> {
    return this.http.get<FactureFournisseur[]>(`${this.apiUrl}/impayees/liste`);
  }
}