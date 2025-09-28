// src/app/features/dashboard/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface DashboardStats {
  produits: {
    total: number;
    en_stock: number;
    en_alerte: number;
    rupture: number;
  };
  commandes: {
    total_mois: number;
    en_attente: number;
    confirmees: number;
    livrees: number;
  };
  chiffres: {
    ca_mois: number;
    ca_annee: number;
    valeur_stock: number;
  };
  alertes: {
    total: number;
    stock_faible: number;
    peremption: number;
  };
  lots: {
    expires_bientot: number;
    expires_aujourdhui: number;
  };
}

export interface VentesParMois {
  mois: number;
  nombre_commandes: number;
  chiffre_affaires: number;
}

export interface TopProduit {
  nom: string;
  code_produit: string;
  quantite_vendue: number;
  chiffre_affaires: number;
  nombre_commandes: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private apiService: ApiService) {}

  getStatistiquesGenerales(): Observable<DashboardStats> {
    return this.apiService.get<DashboardStats>('dashboard/statistiques');
  }

  getVentesParMois(annee?: number): Observable<VentesParMois[]> {
    const params = annee ? { annee } : {};
    return this.apiService.get<VentesParMois[]>('dashboard/ventes-par-mois', params);
  }

  getTopProduits(limit: number = 5): Observable<TopProduit[]> {
    return this.apiService.get<TopProduit[]>('dashboard/top-produits', { limit });
  }

  getTopClients(limit: number = 5): Observable<any[]> {
    return this.apiService.get<any[]>('dashboard/top-clients', { limit });
  }

  getIndicateursPerformance(): Observable<any> {
    return this.apiService.get<any>('dashboard/indicateurs');
  }
}
