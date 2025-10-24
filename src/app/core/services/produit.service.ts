import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Produit, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {
  private apiUrl = `${environment.apiUrl}/produits`;

  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<PaginatedResponse<Produit>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) {
          httpParams = httpParams.append(key, params[key]);
        }
      });
    }
    return this.http.get<PaginatedResponse<Produit>>(this.apiUrl, { params: httpParams });
  }

  getById(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/${id}`);
  }

  create(produit: Produit): Observable<any> {
    return this.http.post(this.apiUrl, produit);
  }

  update(id: number, produit: Partial<Produit>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, produit);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  verifierStock(): Observable<any> {
    return this.http.get(`${this.apiUrl}/verifier/stock`);
  }
}
