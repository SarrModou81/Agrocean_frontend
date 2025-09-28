import { Produit } from "./produit.model";

export interface Stock {
  id: number;
  produit_id: number;
  quantite_disponible: number;
  quantite_reservee: number;
  seuil_alerte: number;
  emplacement: string;
  alerte_active: boolean;
  created_at: string;
  updated_at: string;
  produit?: Produit;
}