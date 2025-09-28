import { Lot } from "./lot.model";

export interface Fournisseur {
  id: number;
  nom: string;
  contact: string;
  adresse: string;
  telephone: string;
  email?: string;
  type_fournisseur: 'Agriculteur' | 'Pecheur' | 'Cooperative' | 'Grossiste';
  created_at: string;
  updated_at: string;
  lots?: Lot[];
}