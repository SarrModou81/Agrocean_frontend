// src/app/core/models/mouvement-stock.model.ts
import { Produit } from "./produit.model";
import { Lot } from "./lot.model";
import { User } from "./user.model";

export interface MouvementStock {
  id: number;
  produit_id: number;
  lot_id?: number;
  type_mouvement: 'Entree' | 'Sortie' | 'Transfert' | 'Ajustement' | 'Perte';
  quantite: number;
  date_mouvement: string;
  motif: string;
  justification?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  produit?: Produit;
  lot?: Lot;
  user?: User;
}
