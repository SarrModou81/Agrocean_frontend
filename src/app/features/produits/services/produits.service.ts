// src/app/features/produits/services/produits.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Produit } from '../../../core/models/produit.model';
import { PaginatedResponse } from '../../../core/models/api-response.model';

export interface ProduitFilters {
  search?: string;
  categorie?: string;
  is_active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProduitsService {
  constructor(private apiService: ApiService) {}

  getProduits(page: number = 1, perPage: number = 15, filters?: ProduitFilters): Observable<PaginatedResponse<Produit>> {
    return this.apiService.getPaginated<Produit>('produits', page, perPage, filters);
  }

  getProduit(id: number): Observable<Produit> {
    return this.apiService.get<Produit>(`produits/${id}`);
  }

  createProduit(produit: Partial<Produit>): Observable<Produit> {
    return this.apiService.post<Produit>('produits', produit);
  }

  updateProduit(id: number, produit: Partial<Produit>): Observable<Produit> {
    return this.apiService.put<Produit>(`produits/${id}`, produit);
  }

  deleteProduit(id: number): Observable<any> {
    return this.apiService.delete(`produits/${id}`);
  }

  getCatalog(): Observable<Produit[]> {
    return this.apiService.get<Produit[]>('produits-catalog');
  }
}
