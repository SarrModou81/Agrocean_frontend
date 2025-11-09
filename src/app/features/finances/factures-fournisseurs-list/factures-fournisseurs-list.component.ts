// src/app/features/finances/factures-fournisseurs-list/factures-fournisseurs-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FactureFournisseurService } from '../../../core/services/facture-fournisseur.service';
import { FactureFournisseur } from '../../../core/models';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-factures-fournisseurs-list',
  templateUrl: './factures-fournisseurs-list.component.html',
  styleUrls: ['./factures-fournisseurs-list.component.scss']
})
export class FacturesFournisseursListComponent implements OnInit {
  factures: FactureFournisseur[] = [];
  loading = false;

  totalRecords = 0;
  currentPage = 1;
  pageSize = 20;

  statuts = [
    { label: 'Impayée', value: 'Impayée' },
    { label: 'Partiellement Payée', value: 'Partiellement Payée' },
    { label: 'Payée', value: 'Payée' },
    { label: 'Annulée', value: 'Annulée' }
  ];

  selectedStatut: string = '';

  constructor(
    private factureFournisseurService: FactureFournisseurService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadFactures();
  }

  loadFactures(): void {
    this.loading = true;
    const params: any = {
      page: this.currentPage,
      per_page: this.pageSize
    };

    if (this.selectedStatut) {
      params.statut = this.selectedStatut;
    }

    this.factureFournisseurService.getAll(params).subscribe({
      next: (response) => {
        this.factures = response.data;
        this.totalRecords = response.total;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement'
        });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadFactures();
  }

  clearFilters(): void {
    this.selectedStatut = '';
    this.applyFilters();
  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.loadFactures();
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }

  getStatutSeverity(statut: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined {
    const severityMap: Record<string, 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast'> = {
      'Impayée': 'danger',
      'Partiellement Payée': 'warning',
      'Payée': 'success',
      'Annulée': 'secondary'
    };
    return severityMap[statut] || 'info';
  }

  downloadPDF(facture: FactureFournisseur): void {
    if (!facture.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'ID de facture invalide'
      });
      return;
    }

    this.factureFournisseurService.genererPDF(facture.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `facture-fournisseur-${facture.numero}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Facture téléchargée avec succès'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du téléchargement de la facture'
        });
      }
    });
  }

  printFacture(facture: FactureFournisseur): void {
    if (!facture.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'ID de facture invalide'
      });
      return;
    }

    this.factureFournisseurService.genererPDF(facture.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.addEventListener('load', () => {
            printWindow.print();
          });
        }
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de l\'impression de la facture'
        });
      }
    });
  }
}