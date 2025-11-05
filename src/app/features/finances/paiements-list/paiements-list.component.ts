// src/app/features/finances/paiements-list/paiements-list.component.ts
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
  selectedType: string = '';

  types = [
    { label: 'Paiements Clients', value: 'client' },
    { label: 'Paiements Fournisseurs', value: 'fournisseur' }
  ];

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

    // Filtrer par type (client ou fournisseur)
    if (this.selectedType === 'client') {
      params.has_facture = true;
    } else if (this.selectedType === 'fournisseur') {
      params.has_facture_fournisseur = true;
    }

    this.paiementService.getAll(params).subscribe({
      next: (response) => {
        this.paiements = response.data;
        this.totalRecords = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement paiements:', error);
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
    this.selectedType = '';
    this.applyFilters();
  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.loadPaiements();
  }

  /**
   * Détermine le type de paiement (Client ou Fournisseur)
   */
  getTypePaiement(paiement: Paiement): string {
    if (paiement.facture_id || paiement.client) {
      return 'Client';
    } else if (paiement.facture_fournisseur_id || paiement.fournisseur) {
      return 'Fournisseur';
    }
    return 'N/A';
  }

  /**
   * Récupère le nom de l'entité (client ou fournisseur)
   */
  getNomEntite(paiement: any): string {
    // Essayer d'abord via la facture
    if (paiement.facture?.vente?.client?.nom) {
      return paiement.facture.vente.client.nom;
    }
    
    // Essayer via la facture fournisseur
    if (paiement.factureFournisseur?.fournisseur?.nom) {
      return paiement.factureFournisseur.fournisseur.nom;
    }

    // Essayer directement via les relations
    if (paiement.client?.nom) {
      return paiement.client.nom;
    }
    
    if (paiement.fournisseur?.nom) {
      return paiement.fournisseur.nom;
    }

    return 'N/A';
  }

  /**
   * Récupère le numéro de facture
   */
  getNumeroFacture(paiement: any): string | null {
    // Facture client
    if (paiement.facture?.numero) {
      return paiement.facture.numero;
    }
    
    // Facture fournisseur
    if (paiement.factureFournisseur?.numero) {
      return paiement.factureFournisseur.numero;
    }

    return null;
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