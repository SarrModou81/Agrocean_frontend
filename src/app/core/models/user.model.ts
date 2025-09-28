export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  secteur?: string;
  specialite?: string;
  certification?: string;
  type_role: 'Commercial' | 'GestionnaireStock' | 'ResponsableAppro' | 'AdminFinance' | 'Directeur';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}