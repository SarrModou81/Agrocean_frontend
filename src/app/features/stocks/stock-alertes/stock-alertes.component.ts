import { Component, OnInit } from '@angular/core';
import { AlerteService } from '../../../core/services/all-services';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProduitService } from '../../../core/services/produit.service';

@Component({
  selector: 'app-stock-alertes',
  templateUrl: './stock-alertes.component.html',
  styleUrls: ['./stock-alertes.component.scss']
})
export class StockAlertesComponent implements OnInit {
  alertes: any[] = [];
  loading = false;
  selectedType: string = '';
  showOnlyUnread = true;

  totalRecords = 0;
  currentPage = 1;
  pageSize = 20;

  types = [
    { label: 'Stock Faible', value: 'StockFaible' },
    { label: 'Péremption', value: 'Péremption' },
    { label: 'Rupture', value: 'Rupture' }
  ];

  constructor(
    private alerteService: AlerteService,
    private produitService: ProduitService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadAlertes();
    this.verifierStocks();
  }

  loadAlertes(): void {
    this.loading = true;
    const params: any = {
      page: this.currentPage,
      per_page: this.pageSize
    };

    if (this.selectedType) {
      params.type = this.selectedType;
    }

    if (this.showOnlyUnread) {
      params.lue = false;
    }

    this.alerteService.getAll(params).subscribe({
      next: (response) => {
        this.alertes = response.data;
        this.totalRecords = response.total;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des alertes'
        });
        this.loading = false;
      }
    });
  }

  verifierStocks(): void {
    this.produitService.verifierStock().subscribe({
      next: (data) => {
        if (data.rupture?.length > 0 || data.faible_stock?.length > 0) {
          this.loadAlertes();
        }
      }
    });
  }

  marquerLue(alerte: any): void {
    this.alerteService.marquerLue(alerte.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Alerte marquée comme lue'
        });
        this.loadAlertes();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la mise à jour'
        });
      }
    });
  }

  supprimerAlerte(alerte: any): void {
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir supprimer cette alerte ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.alerteService.delete(alerte.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Alerte supprimée avec succès'
            });
            this.loadAlertes();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la suppression'
            });
          }
        });
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadAlertes();
  }

  clearFilters(): void {
    this.selectedType = '';
    this.showOnlyUnread = true;
    this.applyFilters();
  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.loadAlertes();
  }

  getAlerteSeverity(type: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' {
    const severityMap: Record<string, 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast'> = {
      'StockFaible': 'warning',
      'Péremption': 'danger',
      'Rupture': 'danger'
    };
    return severityMap[type] || 'info';
  }
}