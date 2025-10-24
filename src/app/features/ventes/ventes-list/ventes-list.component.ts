// src/app/features/ventes/ventes-list/ventes-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VenteService, ClientService } from '../../../core/services/all-services';
import { Vente, Client } from '../../../core/models';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-ventes-list',
  templateUrl: './ventes-list.component.html',
  styleUrls: ['./ventes-list.component.scss']
})
export class VentesListComponent implements OnInit {
  ventes: Vente[] = [];
  clients: Client[] = [];
  loading = false;

  totalRecords = 0;
  currentPage = 1;
  pageSize = 20;

  selectedClient: number | null = null;
  selectedStatut: string = '';
  dateDebut: Date | null = null;
  dateFin: Date | null = null;

  statuts = [
    { label: 'Brouillon', value: 'Brouillon' },
    { label: 'Validée', value: 'Validée' },
    { label: 'Livrée', value: 'Livrée' },
    { label: 'Annulée', value: 'Annulée' }
  ];

  constructor(
    private venteService: VenteService,
    private clientService: ClientService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadVentes();
  }

  loadClients(): void {
    this.clientService.getAll().subscribe({
      next: (response) => {
        this.clients = response.data;
      }
    });
  }

  loadVentes(): void {
    this.loading = true;
    const params: any = {
      page: this.currentPage,
      per_page: this.pageSize
    };

    if (this.selectedClient) {
      params.client_id = this.selectedClient;
    }

    if (this.selectedStatut) {
      params.statut = this.selectedStatut;
    }

    if (this.dateDebut) {
      params.date_debut = this.formatDate(this.dateDebut);
    }

    if (this.dateFin) {
      params.date_fin = this.formatDate(this.dateFin);
    }

    this.venteService.getAll(params).subscribe({
      next: (response) => {
        this.ventes = response.data;
        this.totalRecords = response.total;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des ventes'
        });
        this.loading = false;
      }
    });
  }

  nouvelleVente(): void {
    this.router.navigate(['/ventes/create']);
  }

  voirDetails(vente: Vente): void {
    this.router.navigate(['/ventes', vente.id]);
  }

  validerVente(vente: Vente): void {
    this.confirmationService.confirm({
      message: `Valider la vente ${vente.numero} ?`,
      header: 'Confirmation',
      icon: 'pi pi-check',
      accept: () => {
        this.venteService.valider(vente.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Vente validée avec succès'
            });
            this.loadVentes();
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

  annulerVente(vente: Vente): void {
    this.confirmationService.confirm({
      message: `Annuler la vente ${vente.numero} ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.venteService.annuler(vente.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Vente annulée avec succès'
            });
            this.loadVentes();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de l\'annulation'
            });
          }
        });
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadVentes();
  }

  clearFilters(): void {
    this.selectedClient = null;
    this.selectedStatut = '';
    this.dateDebut = null;
    this.dateFin = null;
    this.applyFilters();
  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.loadVentes();
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getStatutSeverity(statut: string): string {
    const map: any = {
      'Brouillon': 'info',
      'Validée': 'warning',
      'Livrée': 'success',
      'Annulée': 'danger'
    };
    return map[statut] || 'info';
  }
}