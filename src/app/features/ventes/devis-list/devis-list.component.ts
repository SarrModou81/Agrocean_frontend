import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VenteService, ClientService } from '../../../core/services/all-services';
import { Vente, Client } from '../../../core/models';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-devis-list',
  templateUrl: './devis-list.component.html',
  styleUrls: ['./devis-list.component.scss']
})
export class DevisListComponent implements OnInit {
  devis: Vente[] = [];
  clients: Client[] = [];
  loading = false;

  totalRecords = 0;
  currentPage = 1;
  pageSize = 20;

  selectedClient: number | null = null;
  dateDebut: Date | null = null;
  dateFin: Date | null = null;

  constructor(
    private venteService: VenteService,
    private clientService: ClientService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadDevis();
  }

  loadClients(): void {
    this.clientService.getAll().subscribe({
      next: (response) => {
        this.clients = response.data;
      }
    });
  }

  loadDevis(): void {
    this.loading = true;
    const params: any = {
      page: this.currentPage,
      per_page: this.pageSize,
      statut: 'Brouillon' // Filtrer uniquement les devis (ventes en brouillon)
    };

    if (this.selectedClient) {
      params.client_id = this.selectedClient;
    }

    if (this.dateDebut) {
      params.date_debut = this.formatDate(this.dateDebut);
    }

    if (this.dateFin) {
      params.date_fin = this.formatDate(this.dateFin);
    }

    this.venteService.getAll(params).subscribe({
      next: (response) => {
        this.devis = response.data;
        this.totalRecords = response.total;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des devis'
        });
        this.loading = false;
      }
    });
  }

  nouveauDevis(): void {
    this.router.navigate(['/ventes/create']);
  }

  voirDetails(devis: Vente): void {
    this.router.navigate(['/ventes', devis.id]);
  }

  validerDevis(devis: Vente): void {
    this.confirmationService.confirm({
      message: `Valider le devis ${devis.numero} ? Cela le transformera en vente.`,
      header: 'Confirmation',
      icon: 'pi pi-check',
      accept: () => {
        this.venteService.valider(devis.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Devis validé avec succès'
            });
            this.loadDevis();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la validation du devis'
            });
          }
        });
      }
    });
  }

  annulerDevis(devis: Vente): void {
    this.confirmationService.confirm({
      message: `Annuler le devis ${devis.numero} ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.venteService.annuler(devis.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Devis annulé avec succès'
            });
            this.loadDevis();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de l\'annulation du devis'
            });
          }
        });
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadDevis();
  }

  clearFilters(): void {
    this.selectedClient = null;
    this.dateDebut = null;
    this.dateFin = null;
    this.applyFilters();
  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.loadDevis();
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatCurrency(value: any): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0 FCFA';
    return numValue.toLocaleString('fr-FR') + ' FCFA';
  }

  getStatutSeverity(statut: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined {
    const severityMap: Record<string, 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast'> = {
      'Brouillon': 'secondary',
      'Validée': 'info',
      'Livrée': 'success',
      'Annulée': 'danger'
    };
    return severityMap[statut] || 'secondary';
  }
}
