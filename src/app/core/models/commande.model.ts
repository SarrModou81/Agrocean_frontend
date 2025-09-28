import { Client } from "./client.model";
import { Facture } from "./facture.model";
import { LigneCommande } from "./ligne-commande.model";
import { Livraison } from "./livraison.model";
import { User } from "./user.model";

export interface Commande {
  id: number;
  numero_commande: string;
  client_id: number;
  commercial_id: number;
  date_commande: string;
  date_livraison_prevue: string;
  statut_commande: 'En_attente' | 'Confirmee' | 'En_preparation' | 'Livree' | 'Annulee';
  montant_total: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  client?: Client;
  commercial?: User;
  ligneCommandes?: LigneCommande[];
  facture?: Facture;
  livraison?: Livraison;
}