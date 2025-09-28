import { Commande } from "./commande.model";

export interface Facture {
  id: number;
  numero_facture: string;
  commande_id: number;
  date_emission: string;
  montant_ht: number;
  montant_ttc: number;
  statut_paiement: 'En_attente' | 'Partiel' | 'Paye' | 'Annule';
  date_paiement?: string;
  mode_paiement?: string;
  montant_paye: number;
  created_at: string;
  updated_at: string;
  commande?: Commande;
}