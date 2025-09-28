import { Produit } from "./produit.model";
import { User } from "./user.model";

export interface Alerte {
  id: number;
  type_alerte: 'Stock_faible' | 'Peremption_proche' | 'Rupture_stock' | 'Commande_urgente';
  message: string;
  date_alerte: string;
  lu: boolean;
  produit_id?: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  produit?: Produit;
  user?: User;
}