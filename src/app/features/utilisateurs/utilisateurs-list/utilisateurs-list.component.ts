// src/app/features/utilisateurs/utilisateurs-list/utilisateurs-list.component.ts
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/all-services';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-utilisateurs-list',
  templateUrl: './utilisateurs-list.component.html',
  styleUrls: ['./utilisateurs-list.component.scss']
})
export class UtilisateursListComponent implements OnInit {
  utilisateurs: any[] = [];
  loading = false;
  displayDialog = false;
  selectedUtilisateur: any = null;
  isEditing = false;

  totalRecords = 0;
  currentPage = 1;
  pageSize = 20;

  selectedRole: string = '';
  searchTerm: string = '';

  roles = [
    { label: 'Administrateur', value: 'Administrateur' },
    { label: 'Commercial', value: 'Commercial' },
    { label: 'Gestionnaire Stock', value: 'GestionnaireStock' },
    { label: 'Comptable', value: 'Comptable' },
    { label: 'Agent Approvisionnement', value: 'AgentApprovisionnement' }
  ];

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.loading = true;
    const params: any = {
      page: this.currentPage,
      per_page: this.pageSize
    };

    if (this.selectedRole) {
      params.role = this.selectedRole;
    }

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    this.userService.getAll(params).subscribe({
      next: (response) => {
        this.utilisateurs = response.data;
        this.totalRecords = response.total;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des utilisateurs'
        });
        this.loading = false;
      }
    });
  }

  openNew(): void {
    this.selectedUtilisateur = null;
    this.isEditing = false;
    this.displayDialog = true;
  }

  editUtilisateur(utilisateur: any): void {
    this.selectedUtilisateur = { ...utilisateur };
    this.isEditing = true;
    this.displayDialog = true;
  }

  toggleActive(utilisateur: any): void {
    this.confirmationService.confirm({
      message: `${utilisateur.is_active ? 'Désactiver' : 'Activer'} ${utilisateur.prenom} ${utilisateur.nom} ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.toggleActive(utilisateur.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: `Utilisateur ${utilisateur.is_active ? 'désactivé' : 'activé'} avec succès`
            });
            this.loadUtilisateurs();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la modification'
            });
          }
        });
      }
    });
  }

  deleteUtilisateur(utilisateur: any): void {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer ${utilisateur.prenom} ${utilisateur.nom} ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.delete(utilisateur.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Utilisateur supprimé avec succès'
            });
            this.loadUtilisateurs();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: error.error?.message || 'Erreur lors de la suppression'
            });
          }
        });
      }
    });
  }

  onDialogHide(): void {
    this.loadUtilisateurs();
    this.displayDialog = false;
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadUtilisateurs();
  }

  clearFilters(): void {
    this.selectedRole = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.loadUtilisateurs();
  }

  getRoleDisplay(role: string): string {
    const roleMap: { [key: string]: string } = {
      'Administrateur': 'Administrateur',
      'Commercial': 'Commercial',
      'GestionnaireStock': 'Gestionnaire Stock',
      'Comptable': 'Comptable',
      'AgentApprovisionnement': 'Agent Appro.'
    };
    return roleMap[role] || role;
  }

getRoleSeverity(role: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined {
  const severityMap: Record<string, 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast'> = {
    'Administrateur': 'danger',
    'Commercial': 'success',
    'GestionnaireStock': 'info',
    'Comptable': 'warning',
    'AgentApprovisionnement': 'contrast'
  };
  return severityMap[role] || 'info';
}
}