import { Commande } from "./commande.model";

export interface Client {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
  email?: string;
  type_client: 'Menage' | 'Restaurant' | 'Boutique' | 'GrandeSurface' | 'Institution';
  date_creation: string;
  created_at: string;
  updated_at: string;
  commandes?: Commande[];
}