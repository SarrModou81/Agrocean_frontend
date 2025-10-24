// Modèles de données pour l'application AGROCEAN

export interface Client {
  id?: number;
  nom: string;
  email?: string;
  telephone: string;
  adresse: string;
  type: 'Menage' | 'Boutique' | 'GrandeSurface' | 'Restaurant' | 'Institution';
  credit_max: number;
  solde: number;
  created_at?: string;
  updated_at?: string;
}

export interface Fournisseur {
  id?: number;
  nom: string;
  contact: string;
  telephone: string;
  adresse: string;
  evaluation: number;
  conditions?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Categorie {
  id?: number;
  nom: string;
  description?: string;
  type_stockage: 'Frais' | 'Congelé' | 'AmbiantSec' | 'AmbiantHumide';
  created_at?: string;
  updated_at?: string;
  produits_count?: number;
}

export interface Produit {
  id?: number;
  code: string;
  nom: string;
  description?: string;
  categorie_id: number;
  categorie?: Categorie;
  prix_achat: number;
  prix_vente: number;
  seuil_minimum: number;
  peremption: boolean;
  created_at?: string;
  updated_at?: string;
  stock_total?: number;
  marge?: number;
}

export interface Entrepot {
  id?: number;
  nom: string;
  adresse: string;
  capacite: number;
  type_froid: 'Frais' | 'Congelé' | 'Ambiant' | 'Mixte';
  created_at?: string;
  updated_at?: string;
  capacite_disponible?: number;
  stocks_count?: number;
}

export interface Stock {
  id?: number;
  produit_id: number;
  produit?: Produit;
  entrepot_id: number;
  entrepot?: Entrepot;
  quantite: number;
  emplacement: string;
  date_entree: string;
  numero_lot?: string;
  date_peremption?: string;
  statut: 'Disponible' | 'Réservé' | 'Périmé' | 'Endommagé';
  created_at?: string;
  updated_at?: string;
  valeur?: number;
  etat_peremption?: 'ok' | 'warning' | 'expired';
}

export interface Vente {
  id?: number;
  numero: string;
  client_id: number;
  client?: Client;
  user_id: number;
  user?: any;
  date_vente: string;
  montant_ht: number;
  montant_ttc: number;
  remise: number;
  statut: 'Brouillon' | 'Validée' | 'Livrée' | 'Annulée';
  created_at?: string;
  updated_at?: string;
  detail_ventes?: DetailVente[];
  facture?: Facture;
  livraison?: Livraison;
}

export interface DetailVente {
  id?: number;
  vente_id: number;
  produit_id: number;
  produit?: Produit;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
}

export interface CommandeAchat {
  id?: number;
  numero: string;
  fournisseur_id: number;
  fournisseur?: Fournisseur;
  user_id: number;
  user?: any;
  date_commande: string;
  date_livraison_prevue?: string;
  statut: 'Brouillon' | 'Validée' | 'EnCours' | 'Reçue' | 'Annulée';
  montant_total: number;
  created_at?: string;
  updated_at?: string;
  detail_commande_achats?: DetailCommandeAchat[];
}

export interface DetailCommandeAchat {
  id?: number;
  commande_achat_id: number;
  produit_id: number;
  produit?: Produit;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
}

export interface Livraison {
  id?: number;
  vente_id: number;
  vente?: Vente;
  date_prevue: string;
  date_effective?: string;
  adresse: string;
  statut: 'Planifiée' | 'EnCours' | 'Livrée' | 'Annulée';
  livreur?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Facture {
  id?: number;
  numero: string;
  vente_id: number;
  vente?: Vente;
  date_emission: string;
  date_echeance: string;
  montant_ttc: number;
  statut: 'Impayée' | 'Partiellement Payée' | 'Payée' | 'Annulée';
  created_at?: string;
  updated_at?: string;
  paiements?: Paiement[];
  montant_paye?: number;
  montant_restant?: number;
  jours_retard?: number;
}

export interface Paiement {
  id?: number;
  facture_id?: number;
  facture?: Facture;
  client_id?: number;
  client?: Client;
  fournisseur_id?: number;
  fournisseur?: Fournisseur;
  montant: number;
  date_paiement: string;
  mode_paiement: 'Espèces' | 'Chèque' | 'Virement' | 'MobileMoney' | 'Carte';
  reference?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Alerte {
  id?: number;
  type: 'StockFaible' | 'Péremption' | 'Rupture';
  produit_id?: number;
  produit?: Produit;
  message: string;
  lue: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BilanFinancier {
  id?: number;
  periode: string;
  date_debut: string;
  date_fin: string;
  chiffre_affaires: number;
  charges_exploitation: number;
  benefice_net: number;
  marge_globale: number;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  ventes_jour: number;
  ventes_mois: number;
  commandes_attente: number;
  alertes_actives: number;
  produits_rupture: number;
  valeur_stock: number;
  top_produits: any[];
  evolution_ventes: any[];
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
