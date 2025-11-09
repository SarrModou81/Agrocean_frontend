import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BilanFinancier, Facture, Paiement, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private apiUrl = `${environment.apiUrl}/bilans`;

  constructor(private http: HttpClient) {}

  // ========== BILANS ==========
  getAll(params?: any): Observable<PaginatedResponse<BilanFinancier>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.append(key, params[key]);
      });
    }
    return this.http.get<PaginatedResponse<BilanFinancier>>(this.apiUrl, { params: httpParams });
  }

  getById(id: number): Observable<BilanFinancier> {
    return this.http.get<BilanFinancier>(`${this.apiUrl}/${id}`);
  }

  genererBilan(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/generer`, data);
  }

  // ========== TRÉSORERIE ==========
  etatTresorerie(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.append(key, params[key]);
      });
    }
    return this.http.get(`${this.apiUrl}/tresorerie/etat`, { params: httpParams });
  }

  // ========== COMPTE DE RÉSULTAT ==========
  compteResultat(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.append(key, params[key]);
      });
    }
    return this.http.get(`${this.apiUrl}/compte-resultat`, { params: httpParams });
  }

  // ========== BILAN COMPTABLE ==========
  bilanComptable(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.append(key, params[key]);
      });
    }
    return this.http.get(`${this.apiUrl}/bilan-comptable`, { params: httpParams });
  }

  // ========== DASHBOARD FINANCIER ==========
  dashboardFinancier(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard-financier`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class FactureService {
  private apiUrl = `${environment.apiUrl}/factures`;

  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<PaginatedResponse<Facture>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.append(key, params[key]);
      });
    }
    return this.http.get<PaginatedResponse<Facture>>(this.apiUrl, { params: httpParams });
  }

  getById(id: number): Observable<Facture> {
    return this.http.get<Facture>(`${this.apiUrl}/${id}`);
  }

  create(facture: any): Observable<any> {
    return this.http.post(this.apiUrl, facture);
  }

  update(id: number, facture: Partial<Facture>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, facture);
  }

  impayees(): Observable<Facture[]> {
    return this.http.get<Facture[]>(`${this.apiUrl}/impayees/liste`);
  }

  echues(): Observable<any> {
    return this.http.get(`${this.apiUrl}/echues/liste`);
  }

  genererPDF(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/generer-pdf`, { responseType: 'blob' });
  }

  envoyer(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/envoyer`, {});
  }

  statistiques(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.append(key, params[key]);
      });
    }
    return this.http.get(`${this.apiUrl}/statistiques/analyse`, { params: httpParams });
  }
}

@Injectable({
  providedIn: 'root'
})
export class PaiementService {
  private apiUrl = `${environment.apiUrl}/paiements`;

  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<PaginatedResponse<Paiement>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.append(key, params[key]);
      });
    }
    return this.http.get<PaginatedResponse<Paiement>>(this.apiUrl, { params: httpParams });
  }

  getById(id: number): Observable<Paiement> {
    return this.http.get<Paiement>(`${this.apiUrl}/${id}`);
  }

  create(paiement: Paiement): Observable<any> {
    return this.http.post(this.apiUrl, paiement);
  }
}