// src/app/core/models/inventaire.model.ts
import { User } from "./user.model";
import { LigneInventaire } from "./ligne-inventaire.model";

export interface Inventaire {
  id: number;
  date_inventaire: string;
  responsable_id: number;
  statut: 'En_cours' | 'Termine' | 'Valide';
  date_validation?: string;
  validateur_id?: number;
  created_at: string;
  updated_at: string;
  responsable?: User;
  validateur?: User;
  lignesInventaire?: LigneInventaire[];
}
