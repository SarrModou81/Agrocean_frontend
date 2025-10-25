import { Component, OnInit } from '@angular/core';
import { PaiementService } from '../../../core/services/all-services';
import { Paiement } from '../../../core/models';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-paiements-list',
  templateUrl: './paiements-list.component.html',
  styleUrls: ['./paiements-list.component.scss']
})
export class PaiementsListComponent implements OnInit {
  paiements: Paiement[] = [];
  loading = false;
  displayDialog = false;

  totalRecords = 0;
  currentPage = 1;
  pageSize = 20;

  dateDebut: Date | null = null;
  dateFin: Date | null = null;
  selectedMode: string = '';

  modes = [
    { label: 'Espèces', value: 'Espèces' },
    { label: 'Chèque', value: 'Chèque' },
    { label: 'Virement', value: 'Virement' },
    { label: 'Mobile Money', value: 'MobileMoney' },
    { label: 'Carte', value: 'Carte' }
  ];

  constructor(
    private paiementService: PaiementService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadPaiements();
  }

  loadPaiements(): void {
    this.loading = true;
    const params: any = {
      page: this.currentPage,
      per_page: this.pageSize
    };

    if (this.dateDebut) {
      params.date_debut = this.formatDate(this.dateDebut);
    }

    if (this.dateFin) {
      params.date_fin = this.formatDate(this.dateFin);
    }

    if (this.selectedMode) {
      params.mode_paiement = this.selectedMode;
    }

    this.paiementService.getAll(params).subscribe({
      next: (response) => {
        this.paiements = response.data;
        this.totalRecords = response.total;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des paiements'
        });
        this.loading = false;
      }
    });
  }

  openNew(): void {
    this.displayDialog = true;
  }

  onDialogHide(): void {
    this.loadPaiements();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadPaiements();
  }

  clearFilters(): void {
    this.dateDebut = null;
    this.dateFin = null;
    this.selectedMode = '';
    this.applyFilters();
  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.loadPaiements();
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getModeSeverity(mode: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined {
  const severityMap: Record<string, 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast'> = {
    'Espèces': 'success',
    'Chèque': 'warning',
    'Virement': 'info',
    'MobileMoney': 'contrast',
    'Carte': 'secondary'
  };
  return severityMap[mode] || 'info';
}
}