import { Lot } from "./lot.model";
import { Stock } from "./stock.model";

export interface Produit {
  id: number;
  nom: string;
  description?: string;
  code_produit: string;
  categorie: 'Fruit' | 'Legume' | 'Poisson' | 'Crustace' | 'Halieutique';
  unite_mesure: 'kg' | 'paquet' | 'piece';
  prix_unitaire: number;
  duree_conservation: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  stock?: Stock;
  lots?: Lot[];
}