import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommandeAchatService, FournisseurService } from '../../../core/services/all-services';
import { CommandeAchat, Fournisseur } from '../../../core/models';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-commandes-achat-list',
  templateUrl: './commandes-achat-list.component.html',
  styleUrls: ['./commandes-achat-list.component.scss']
})
export class CommandesAchatListComponent implements OnInit {
  commandes: CommandeAchat[] = [];
  fournisseurs: Fournisseur[] = [];
  loading = false;

  totalRecords = 0;
  currentPage = 1;
  pageSize = 20;

  selectedFournisseur: number | null = null;
  selectedStatut: string = '';

  statuts = [
    { label: 'Brouillon', value: 'Brouillon' },
    { label: 'Validée', value: 'Validée' },
    { label: 'En Cours', value: 'EnCours' },
    { label: 'Reçue', value: 'Reçue' },
    { label: 'Annulée', value: 'Annulée' }
  ];

  constructor(
    private commandeService: CommandeAchatService,
    private fournisseurService: FournisseurService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFournisseurs();
    this.loadCommandes();
  }

  loadFournisseurs(): void {
    this.fournisseurService.getAll().subscribe({
      next: (response) => {
        this.fournisseurs = response.data;
      }
    });
  }

  loadCommandes(): void {
    this.loading = true;
    const params: any = {
      page: this.currentPage,
      per_page: this.pageSize
    };

    if (this.selectedFournisseur) {
      params.fournisseur_id = this.selectedFournisseur;
    }

    if (this.selectedStatut) {
      params.statut = this.selectedStatut;
    }

    this.commandeService.getAll(params).subscribe({
      next: (response) => {
        this.commandes = response.data;
        this.totalRecords = response.total;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des commandes'
        });
        this.loading = false;
      }
    });
  }

  nouvelleCommande(): void {
    this.router.navigate(['/commandes-achat/create']);
  }

  voirDetails(commande: CommandeAchat): void {
    this.router.navigate(['/commandes-achat', commande.id]);
  }

  validerCommande(commande: CommandeAchat): void {
    this.confirmationService.confirm({
      message: `Valider la commande ${commande.numero} ?`,
      header: 'Confirmation',
      icon: 'pi pi-check',
      accept: () => {
        this.commandeService.valider(commande.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Commande validée avec succès'
            });
            this.loadCommandes();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la validation'
            });
          }
        });
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadCommandes();
  }

  clearFilters(): void {
    this.selectedFournisseur = null;
    this.selectedStatut = '';
    this.applyFilters();
  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.loadCommandes();
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }

  getStatutSeverity(statut: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined {
  const severityMap: Record<string, 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast'> = {
    'Brouillon': 'info',
    'Validée': 'warning',
    'EnCours': 'contrast',
    'Reçue': 'success',
    'Annulée': 'danger'
  };
  return severityMap[statut] || 'info';
}
}