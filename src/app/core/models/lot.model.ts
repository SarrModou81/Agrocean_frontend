import { Fournisseur } from "./fournisseur.model";
import { Produit } from "./produit.model";

export interface Lot {
  id: number;
  numero_lot: string;
  produit_id: number;
  fournisseur_id: number;
  date_peremption: string;
  date_reception: string;
  quantite_initiale: number;
  quantite_restante: number;
  statut: 'Disponible' | 'Epuise' | 'Perime' | 'Retire';
  created_at: string;
  updated_at: string;
  produit?: Produit;
  fournisseur?: Fournisseur;
}