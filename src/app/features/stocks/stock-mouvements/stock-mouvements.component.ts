import { Component, OnInit } from '@angular/core';
import { StockService } from '../../../core/services/all-services';
import { MessageService } from 'primeng/api';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-stock-mouvements',
  templateUrl: './stock-mouvements.component.html',
  styleUrls: ['./stock-mouvements.component.scss']
})
export class StockMouvementsComponent implements OnInit {
  mouvements: any[] = [];
  loading = false;
  dateDebut: Date = new Date(new Date().setDate(new Date().getDate() - 30));
  dateFin: Date = new Date();

  constructor(
    private stockService: StockService,
    private messageService: MessageService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.loadMouvements();
  }

  loadMouvements(): void {
    this.loading = true;

    const params = {
      date_debut: this.formatDate(this.dateDebut),
      date_fin: this.formatDate(this.dateFin)
    };

    console.log('📅 Chargement des mouvements:', params);

    this.stockService.mouvementsPeriode(params.date_debut, params.date_fin).subscribe({
      next: (data) => {
        console.log('✅ Réponse API mouvements:', data);
        console.log('📊 Type de données:', typeof data, Array.isArray(data));
        console.log('📈 Nombre de mouvements:', Array.isArray(data) ? data.length : 'N/A');

        // Gérer le cas où data n'est pas un tableau
        if (Array.isArray(data)) {
          this.mouvements = data;
        } else if (data && typeof data === 'object') {
          // Si la réponse est un objet avec une propriété data
          this.mouvements = data.data || [];
        } else {
          this.mouvements = [];
        }

        console.log('💾 Mouvements stockés:', this.mouvements.length);
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur API mouvements:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des mouvements: ' + (error.message || 'Erreur inconnue')
        });
        this.mouvements = [];
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.loadMouvements();
  }

  exportExcel(): void {
    if (!this.mouvements || this.mouvements.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Aucune donnée à exporter'
      });
      return;
    }

    try {
      // Préparer les données pour l'export
      const dataToExport = this.mouvements.map(mouvement => ({
        'Date': this.exportService.formatDate(mouvement.date),
        'Type': mouvement.type,
        'Produit': mouvement.produit?.nom || '',
        'Code Produit': mouvement.produit?.code || '',
        'Entrepôt': mouvement.entrepot?.nom || '',
        'Numéro de Lot': mouvement.numero_lot || '',
        'Quantité': mouvement.quantite,
        'Motif': mouvement.motif || ''
      }));

      // Exporter en Excel
      this.exportService.exportToExcel(
        dataToExport,
        `Mouvements_Stock_${this.formatDate(this.dateDebut)}_${this.formatDate(this.dateFin)}`,
        'Mouvements'
      );

      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Export Excel réussi'
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors de l\'export Excel'
      });
    }
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }

  getTypeMouvementSeverity(type: string): 'success' | 'danger' | 'info' {
    const severityMap: Record<string, 'success' | 'danger' | 'info'> = {
      'Entrée': 'success',
      'Sortie': 'danger',
      'Ajustement': 'info'
    };
    return severityMap[type] || 'info';
  }
}