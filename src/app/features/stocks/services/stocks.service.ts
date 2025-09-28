// src/app/features/stocks/services/stocks.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Stock } from '../../../core/models/stock.model';
import { MouvementStock } from '../../../core/models/mouvement-stock.model';
import { PaginatedResponse } from '../../../core/models/api-response.model';

export interface StockFilters {
  search?: string;
  alerte_active?: boolean;
  seuil_atteint?: boolean;
}

export interface MouvementFilters {
  produit_id?: number;
  type_mouvement?: string;
  date_debut?: string;
  date_fin?: string;
}

export interface AjustementStock {
  nouvelle_quantite: number;
  motif: string;
  justification?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StocksService {
  constructor(private apiService: ApiService) {}

  getStocks(page: number = 1, perPage: number = 15, filters?: StockFilters): Observable<PaginatedResponse<Stock>> {
    return this.apiService.getPaginated<Stock>('stocks', page, perPage, filters);
  }

  getStock(id: number): Observable<Stock> {
    return this.apiService.get<Stock>(`stocks/${id}`);
  }

  updateStock(id: number, stock: Partial<Stock>): Observable<Stock> {
    return this.apiService.put<Stock>(`stocks/${id}`, stock);
  }

  ajusterStock(id: number, ajustement: AjustementStock): Observable<Stock> {
    return this.apiService.post<Stock>(`stocks/${id}/ajustement`, ajustement);
  }

  getAlertes(): Observable<Stock[]> {
    return this.apiService.get<Stock[]>('stocks/alertes/list');
  }

  getMouvements(page: number = 1, perPage: number = 15, filters?: MouvementFilters): Observable<PaginatedResponse<MouvementStock>> {
    return this.apiService.getPaginated<MouvementStock>('stocks/mouvements/list', page, perPage, filters);
  }

  ajouterEntree(entree: any): Observable<MouvementStock> {
    return this.apiService.post<MouvementStock>('stocks/entree', entree);
  }

  ajouterSortie(sortie: any): Observable<MouvementStock> {
    return this.apiService.post<MouvementStock>('stocks/sortie', sortie);
  }

  getStatistiques(): Observable<any> {
    return this.apiService.get<any>('stocks/statistiques/general');
  }
}