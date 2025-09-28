// src/app/features/commandes/services/commandes.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Commande } from '../../../core/models/commande.model';
import { PaginatedResponse } from '../../../core/models/api-response.model';

export interface CommandeFilters {
  statut_commande?: string;
  client_id?: number;
  commercial_id?: number;
  date_debut?: string;
  date_fin?: string;
}

export interface CreateCommandeRequest {
  client_id: number;
  date_livraison_prevue: string;
  notes?: string;
  lignes: {
    produit_id: number;
    quantite: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class CommandesService {
  constructor(private apiService: ApiService) {}

  getCommandes(page: number = 1, perPage: number = 15, filters?: CommandeFilters): Observable<PaginatedResponse<Commande>> {
    return this.apiService.getPaginated<Commande>('commandes', page, perPage, filters);
  }

  getCommande(id: number): Observable<Commande> {
    return this.apiService.get<Commande>(`commandes/${id}`);
  }

  createCommande(commande: CreateCommandeRequest): Observable<Commande> {
    return this.apiService.post<Commande>('commandes', commande);
  }

  confirmerCommande(id: number): Observable<Commande> {
    return this.apiService.post<Commande>(`commandes/${id}/confirmer`, {});
  }

  annulerCommande(id: number): Observable<Commande> {
    return this.apiService.post<Commande>(`commandes/${id}/annuler`, {});
  }

  getStatistiques(filters?: any): Observable<any> {
    return this.apiService.get<any>('commandes/statistiques/general', filters);
  }
}