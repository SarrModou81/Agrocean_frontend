/*
 * SERVICES API COMPLETS POUR AGROCEAN
 * Ce fichier contient tous les services pour communiquer avec le backend Laravel
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import * as Models from '../models';

// ==================== CLIENT SERVICE ====================
@Injectable({ providedIn: 'root' })
export class ClientService {
  private apiUrl = `${environment.apiUrl}/clients`;
  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<Models.PaginatedResponse<Models.Client>> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get<Models.PaginatedResponse<Models.Client>>(this.apiUrl, { params: httpParams });
  }

  getById(id: number): Observable<Models.Client> {
    return this.http.get<Models.Client>(`${this.apiUrl}/${id}`);
  }

  create(client: Models.Client): Observable<any> {
    return this.http.post(this.apiUrl, client);
  }

  update(id: number, client: Partial<Models.Client>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, client);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  historique(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/historique`);
  }
}

// ==================== STOCK SERVICE ====================
@Injectable({ providedIn: 'root' })
export class StockService {
  private apiUrl = `${environment.apiUrl}/stocks`;
  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<Models.PaginatedResponse<Models.Stock>> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get<Models.PaginatedResponse<Models.Stock>>(this.apiUrl, { params: httpParams });
  }

  getById(id: number): Observable<Models.Stock> {
    return this.http.get<Models.Stock>(`${this.apiUrl}/${id}`);
  }

  create(stock: Models.Stock): Observable<any> {
    return this.http.post(this.apiUrl, stock);
  }

  update(id: number, stock: Partial<Models.Stock>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, stock);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  ajuster(id: number, ajustement: number, motif?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/ajuster`, { ajustement, motif });
  }

  verifierPeremptions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/verifier/peremptions`);
  }

  inventaire(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get(`${this.apiUrl}/inventaire/complet`, { params: httpParams });
  }

  tracer(produitId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/tracer/${produitId}`);
  }

  mouvementsPeriode(dateDebut: string, dateFin: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/mouvements/periode`, {
      params: { date_debut: dateDebut, date_fin: dateFin }
    });
  }
}

// ==================== VENTE SERVICE ====================
@Injectable({ providedIn: 'root' })
export class VenteService {
  private apiUrl = `${environment.apiUrl}/ventes`;
  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<Models.PaginatedResponse<Models.Vente>> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get<Models.PaginatedResponse<Models.Vente>>(this.apiUrl, { params: httpParams });
  }

  getById(id: number): Observable<Models.Vente> {
    return this.http.get<Models.Vente>(`${this.apiUrl}/${id}`);
  }

  create(vente: any): Observable<any> {
    return this.http.post(this.apiUrl, vente);
  }

  update(id: number, vente: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, vente);
  }

  valider(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/valider`, {});
  }

  annuler(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/annuler`, {});
  }

  statistiques(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get(`${this.apiUrl}/statistiques/analyse`, { params: httpParams });
  }
}

// ==================== COMMANDE ACHAT SERVICE ====================
@Injectable({ providedIn: 'root' })
export class CommandeAchatService {
  private apiUrl = `${environment.apiUrl}/commandes-achat`;
  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<Models.PaginatedResponse<Models.CommandeAchat>> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get<Models.PaginatedResponse<Models.CommandeAchat>>(this.apiUrl, { params: httpParams });
  }

  getById(id: number): Observable<Models.CommandeAchat> {
    return this.http.get<Models.CommandeAchat>(`${this.apiUrl}/${id}`);
  }

  create(commande: any): Observable<any> {
    return this.http.post(this.apiUrl, commande);
  }

  valider(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/valider`, {});
  }

  receptionner(id: number, entrepot_id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/receptionner`, { entrepot_id });
  }
}

// ==================== FOURNISSEUR SERVICE ====================
@Injectable({ providedIn: 'root' })
export class FournisseurService {
  private apiUrl = `${environment.apiUrl}/fournisseurs`;
  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<Models.PaginatedResponse<Models.Fournisseur>> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get<Models.PaginatedResponse<Models.Fournisseur>>(this.apiUrl, { params: httpParams });
  }

  getById(id: number): Observable<Models.Fournisseur> {
    return this.http.get<Models.Fournisseur>(`${this.apiUrl}/${id}`);
  }

  create(fournisseur: Models.Fournisseur): Observable<any> {
    return this.http.post(this.apiUrl, fournisseur);
  }

  update(id: number, fournisseur: Partial<Models.Fournisseur>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, fournisseur);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  historique(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/historique`);
  }

  evaluer(id: number, evaluation: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/evaluer`, { evaluation });
  }

  topFournisseurs(): Observable<Models.Fournisseur[]> {
    return this.http.get<Models.Fournisseur[]>(`${this.apiUrl}/top/meilleurs`);
  }

  rechercher(params: any): Observable<Models.PaginatedResponse<Models.Fournisseur>> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get<Models.PaginatedResponse<Models.Fournisseur>>(`${this.apiUrl}/recherche/avancee`, { params: httpParams });
  }
}

// ==================== CATEGORIE SERVICE ====================
@Injectable({ providedIn: 'root' })
export class CategorieService {
  private apiUrl = `${environment.apiUrl}/categories`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Models.Categorie[]> {
    return this.http.get<Models.Categorie[]>(this.apiUrl);
  }

  getById(id: number): Observable<Models.Categorie> {
    return this.http.get<Models.Categorie>(`${this.apiUrl}/${id}`);
  }

  create(categorie: Models.Categorie): Observable<any> {
    return this.http.post(this.apiUrl, categorie);
  }

  update(id: number, categorie: Partial<Models.Categorie>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, categorie);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

// ==================== ENTREPOT SERVICE ====================
@Injectable({ providedIn: 'root' })
export class EntrepotService {
  private apiUrl = `${environment.apiUrl}/entrepots`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Models.Entrepot[]> {
    return this.http.get<Models.Entrepot[]>(this.apiUrl);
  }

  getById(id: number): Observable<Models.Entrepot> {
    return this.http.get<Models.Entrepot>(`${this.apiUrl}/${id}`);
  }

  create(entrepot: Models.Entrepot): Observable<any> {
    return this.http.post(this.apiUrl, entrepot);
  }

  update(id: number, entrepot: Partial<Models.Entrepot>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, entrepot);
  }
}

// ==================== LIVRAISON SERVICE ====================
@Injectable({ providedIn: 'root' })
export class LivraisonService {
  private apiUrl = `${environment.apiUrl}/livraisons`;
  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<Models.PaginatedResponse<Models.Livraison>> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get<Models.PaginatedResponse<Models.Livraison>>(this.apiUrl, { params: httpParams });
  }

  getById(id: number): Observable<Models.Livraison> {
    return this.http.get<Models.Livraison>(`${this.apiUrl}/${id}`);
  }

  create(livraison: Models.Livraison): Observable<any> {
    return this.http.post(this.apiUrl, livraison);
  }

  update(id: number, livraison: Partial<Models.Livraison>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, livraison);
  }

  demarrer(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/demarrer`, {});
  }

  confirmer(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/confirmer`, {});
  }

  annuler(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/annuler`, {});
  }

  aujourdhui(): Observable<any> {
    return this.http.get(`${this.apiUrl}/aujourd-hui/liste`);
  }

  statistiques(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get(`${this.apiUrl}/statistiques/analyse`, { params: httpParams });
  }
}

// ==================== FACTURE SERVICE ====================
@Injectable({ providedIn: 'root' })
export class FactureService {
  private apiUrl = `${environment.apiUrl}/factures`;
  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<Models.PaginatedResponse<Models.Facture>> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get<Models.PaginatedResponse<Models.Facture>>(this.apiUrl, { params: httpParams });
  }

  getById(id: number): Observable<Models.Facture> {
    return this.http.get<Models.Facture>(`${this.apiUrl}/${id}`);
  }

  create(facture: any): Observable<any> {
    return this.http.post(this.apiUrl, facture);
  }

  update(id: number, facture: Partial<Models.Facture>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, facture);
  }

  impayees(): Observable<any> {
    return this.http.get(`${this.apiUrl}/impayees/liste`);
  }

  echues(): Observable<any> {
    return this.http.get(`${this.apiUrl}/echues/liste`);
  }

  genererPDF(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/generer-pdf`);
  }

  envoyer(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/envoyer`, {});
  }

  statistiques(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get(`${this.apiUrl}/statistiques/analyse`, { params: httpParams });
  }
}

// ==================== PAIEMENT SERVICE ====================
@Injectable({ providedIn: 'root' })
export class PaiementService {
  private apiUrl = `${environment.apiUrl}/paiements`;
  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<Models.PaginatedResponse<Models.Paiement>> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get<Models.PaginatedResponse<Models.Paiement>>(this.apiUrl, { params: httpParams });
  }

  getById(id: number): Observable<Models.Paiement> {
    return this.http.get<Models.Paiement>(`${this.apiUrl}/${id}`);
  }

  create(paiement: Models.Paiement): Observable<any> {
    return this.http.post(this.apiUrl, paiement);
  }
}

// ==================== ALERTE SERVICE ====================
@Injectable({ providedIn: 'root' })
export class AlerteService {
  private apiUrl = `${environment.apiUrl}/alertes`;
  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<Models.PaginatedResponse<Models.Alerte>> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get<Models.PaginatedResponse<Models.Alerte>>(this.apiUrl, { params: httpParams });
  }

  getNonLuesCount(): Observable<{count: number}> {
    return this.http.get<{count: number}>(`${this.apiUrl}/non-lues/count`);
  }

  marquerLue(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/lire`, {});
  }

  marquerToutesLues(): Observable<any> {
    return this.http.post(`${this.apiUrl}/tout-lire`, {});
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

// ==================== USER SERVICE ====================
@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<Models.PaginatedResponse<any>> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get<Models.PaginatedResponse<any>>(this.apiUrl, { params: httpParams });
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  create(user: any): Observable<any> {
    return this.http.post(this.apiUrl, user);
  }

  update(id: number, user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, user);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  toggleActive(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/toggle-active`, {});
  }

  assignRole(id: number, role: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/assign-role`, { role });
  }

  resetPassword(id: number, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/reset-password`, { 
      password,
      password_confirmation: password
    });
  }

  statistiques(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/global`);
  }
}

// ==================== RAPPORT SERVICE ====================
@Injectable({ providedIn: 'root' })
export class RapportService {
  private apiUrl = `${environment.apiUrl}/rapports`;
  constructor(private http: HttpClient) {}

  dashboard(): Observable<Models.DashboardStats> {
    return this.http.get<Models.DashboardStats>(`${this.apiUrl}/dashboard`);
  }

  rapportFinancier(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get(`${this.apiUrl}/financier`, { params: httpParams });
  }

  rapportStocks(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get(`${this.apiUrl}/stocks`, { params: httpParams });
  }

  rapportVentes(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get(`${this.apiUrl}/ventes`, { params: httpParams });
  }

  analysePerformances(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get(`${this.apiUrl}/performances`, { params: httpParams });
  }
}

// ==================== FINANCE SERVICE ====================
@Injectable({ providedIn: 'root' })
export class FinanceService {
  private apiUrl = `${environment.apiUrl}/bilans`;
  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<Models.PaginatedResponse<Models.BilanFinancier>> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get<Models.PaginatedResponse<Models.BilanFinancier>>(this.apiUrl, { params: httpParams });
  }

  getById(id: number): Observable<Models.BilanFinancier> {
    return this.http.get<Models.BilanFinancier>(`${this.apiUrl}/${id}`);
  }

  genererBilan(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/generer`, data);
  }

  etatTresorerie(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get(`${this.apiUrl}/tresorerie/etat`, { params: httpParams });
  }

  compteResultat(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get(`${this.apiUrl}/compte-resultat`, { params: httpParams });
  }

  bilanComptable(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get(`${this.apiUrl}/bilan-comptable`, { params: httpParams });
  }

  dashboardFinancier(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard-financier`);
  }
}
