import { Commande } from "./commande.model";

export interface Livraison {
  id: number;
  commande_id: number;
  date_livraison: string;
  adresse_livraison: string;
  livreur: string;
  statut_livraison: 'Programmee' | 'En_cours' | 'Livree' | 'Echec';
  heure_livraison?: string;
  commentaires?: string;
  signature_client?: string;
  date_confirmation?: string;
  created_at: string;
  updated_at: string;
  commande?: Commande;
}