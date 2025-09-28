import { Produit } from "./produit.model";

export interface LigneCommande {
  id: number;
  commande_id: number;
  produit_id: number;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
  created_at: string;
  updated_at: string;
  produit?: Produit;
}