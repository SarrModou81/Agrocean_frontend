// src/app/features/stocks/stocks-list/stocks-list.component.ts
import { Component, OnInit } from '@angular/core';
import { StockService, EntrepotService } from '../../../core/services/all-services';
import { Stock, Entrepot } from '../../../core/models';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-stocks-list',
  templateUrl: './stocks-list.component.html',
  styleUrls: ['./stocks-list.component.scss']
})
export class StocksListComponent implements OnInit {
  stocks: Stock[] = [];
  entrepots: Entrepot[] = [];
  loading = false;
  displayDialog = false;
  displayAjustement = false;
  selectedStock: Stock | null = null;

  totalRecords = 0;
  currentPage = 1;
  pageSize = 20;

  // Filtres
  selectedEntrepot: number | null = null;
  selectedStatut: string = '';
  searchTerm: string = '';

  statuts = [
    { label: 'Disponible', value: 'Disponible' },
    { label: 'Réservé', value: 'Réservé' },
    { label: 'Périmé', value: 'Périmé' },
    { label: 'Endommagé', value: 'Endommagé' }
  ];

  constructor(
    private stockService: StockService,
    private entrepotService: EntrepotService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadEntrepots();
    this.loadStocks();
  }

  loadEntrepots(): void {
    this.entrepotService.getAll().subscribe({
      next: (data) => {
        this.entrepots = data;
      }
    });
  }

  loadStocks(): void {
    this.loading = true;
    const params: any = {
      page: this.currentPage,
      per_page: this.pageSize
    };

    if (this.selectedEntrepot) {
      params.entrepot_id = this.selectedEntrepot;
    }

    if (this.selectedStatut) {
      params.statut = this.selectedStatut;
    }

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    this.stockService.getAll(params).subscribe({
      next: (response) => {
        this.stocks = response.data;
        this.totalRecords = response.total;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des stocks'
        });
        this.loading = false;
      }
    });
  }

  openNew(): void {
    this.displayDialog = true;
  }

  ajusterStock(stock: Stock): void {
    this.selectedStock = { ...stock };
    this.displayAjustement = true;
  }

  deleteStock(stock: Stock): void {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer ce stock ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.stockService.delete(stock.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Stock supprimé avec succès'
            });
            this.loadStocks();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: error.error?.message || error.error?.error || 'Erreur lors de la suppression'
            });
          }
        });
      }
    });
  }

  onDialogHide(): void {
    this.loadStocks();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadStocks();
  }

  clearFilters(): void {
    this.selectedEntrepot = null;
    this.selectedStatut = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.loadStocks();
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }

  getStatutSeverity(statut: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined {
  const severityMap: Record<string, 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast'> = {
    'Disponible': 'success',
    'Réservé': 'warning',
    'Périmé': 'danger',
    'Endommagé': 'danger'
  };
  return severityMap[statut] || 'info';
}

  getPeremptionSeverity(etat: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined {
  const severityMap: Record<string, 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast'> = {
    'ok': 'success',
    'warning': 'warning',
    'expired': 'danger'
  };
  return severityMap[etat] || 'info';
}

  getPeremptionLabel(stock: Stock): string {
    if (!stock.date_peremption) return 'N/A';
    
    const date = new Date(stock.date_peremption);
    return date.toLocaleDateString('fr-FR');
  }
}