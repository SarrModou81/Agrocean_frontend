// src/app/core/models/ligne-inventaire.model.ts
import { Produit } from "./produit.model";
import { Inventaire } from "./inventaire.model";

export interface LigneInventaire {
  id: number;
  inventaire_id: number;
  produit_id: number;
  quantite_systeme: number;
  quantite_physique?: number;
  ecart?: number;
  commentaires?: string;
  created_at: string;
  updated_at: string;
  produit?: Produit;
  inventaire?: Inventaire;
}