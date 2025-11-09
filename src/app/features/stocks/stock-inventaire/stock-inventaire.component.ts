import { Component, OnInit } from '@angular/core';
import { StockService, EntrepotService } from '../../../core/services/all-services';
import { MessageService } from 'primeng/api';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-stock-inventaire',
  templateUrl: './stock-inventaire.component.html',
  styleUrls: ['./stock-inventaire.component.scss']
})
export class StockInventaireComponent implements OnInit {
  inventaire: any = null;
  loading = false;
  selectedEntrepot: number | null = null;
  entrepots: any[] = [];

  constructor(
    private stockService: StockService,
    private entrepotService: EntrepotService,
    private messageService: MessageService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.loadEntrepots();
    this.genererInventaire();
  }

  loadEntrepots(): void {
    this.entrepotService.getAll().subscribe({
      next: (data) => {
        this.entrepots = data;
      }
    });
  }

  genererInventaire(): void {
    this.loading = true;
    const params: any = {};

    if (this.selectedEntrepot) {
      params.entrepot_id = this.selectedEntrepot;
    }

    console.log('📦 Chargement inventaire avec params:', params);

    this.stockService.inventaire(params).subscribe({
      next: (data) => {
        console.log('✅ Réponse API inventaire:', data);
        console.log('📊 Structure:', {
          total_produits: data?.total_produits,
          quantite_totale: data?.quantite_totale,
          valeur_totale: data?.valeur_totale,
          par_entrepot: data?.par_entrepot?.length,
          par_categorie: data?.par_categorie?.length
        });
        this.inventaire = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur API inventaire:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la génération de l\'inventaire: ' + (error.message || error.error?.message || 'Erreur inconnue')
        });
        this.loading = false;
      }
    });
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }

  exportPDF(): void {
    if (!this.inventaire) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Aucune donnée à exporter'
      });
      return;
    }

    window.print();
    
    this.messageService.add({
      severity: 'success',
      summary: 'Export PDF',
      detail: 'Utilisez la boîte de dialogue d\'impression pour sauvegarder en PDF'
    });
  }

  exportExcel(): void {
    if (!this.inventaire) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Aucune donnée à exporter'
      });
      return;
    }

    try {
      const dataToExport: any[] = [];

      // Statistiques globales
      dataToExport.push({
        'Section': 'STATISTIQUES GLOBALES',
        'Libellé': 'Total Produits',
        'Valeur': this.inventaire.total_produits,
        'Montant': ''
      });
      dataToExport.push({
        'Section': 'STATISTIQUES GLOBALES',
        'Libellé': 'Quantité Totale',
        'Valeur': this.inventaire.quantite_totale,
        'Montant': ''
      });
      dataToExport.push({
        'Section': 'STATISTIQUES GLOBALES',
        'Libellé': 'Valeur Totale',
        'Valeur': '',
        'Montant': this.formatCurrency(this.inventaire.valeur_totale)
      });
      dataToExport.push({ 'Section': '', 'Libellé': '', 'Valeur': '', 'Montant': '' });

      // Par entrepôt
      dataToExport.push({
        'Section': 'RÉPARTITION PAR ENTREPÔT',
        'Libellé': 'Entrepôt',
        'Valeur': 'Nombre de Produits',
        'Montant': 'Valeur Totale'
      });
      this.inventaire.par_entrepot?.forEach((item: any) => {
        dataToExport.push({
          'Section': 'RÉPARTITION PAR ENTREPÔT',
          'Libellé': item.entrepot,
          'Valeur': item.nombre_produits + ' (' + item.quantite_totale + ' unités)',
          'Montant': this.formatCurrency(item.valeur_totale)
        });
      });
      dataToExport.push({ 'Section': '', 'Libellé': '', 'Valeur': '', 'Montant': '' });

      // Par catégorie
      dataToExport.push({
        'Section': 'RÉPARTITION PAR CATÉGORIE',
        'Libellé': 'Catégorie',
        'Valeur': 'Nombre de Produits',
        'Montant': 'Valeur Totale'
      });
      this.inventaire.par_categorie?.forEach((item: any) => {
        dataToExport.push({
          'Section': 'RÉPARTITION PAR CATÉGORIE',
          'Libellé': item.categorie,
          'Valeur': item.nombre_produits + ' (' + item.quantite_totale + ' unités)',
          'Montant': this.formatCurrency(item.valeur_totale)
        });
      });

      this.exportService.exportToExcel(
        dataToExport,
        `Inventaire_Stock_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}`,
        'Inventaire'
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
}