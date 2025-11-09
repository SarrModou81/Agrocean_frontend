import { Component, OnInit } from '@angular/core';
import { StockService, EntrepotService } from '../../../core/services/all-services';
import { MessageService } from 'primeng/api';
import { ExportService } from '../../../core/services/export.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

    this.stockService.inventaire(params).subscribe({
      next: (data) => {
        this.inventaire = data;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la génération de l\'inventaire'
        });
        this.loading = false;
      }
    });
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }

  // Format spécial pour PDF (sans espace insécable)
  formatCurrencyForPDF(value: number | string): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    const formatted = numValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return formatted + ' FCFA';
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

    try {
      const doc = new jsPDF();

      // Couleurs du logo AGROCEAN
      const vertAgro: [number, number, number] = [91, 140, 62]; // Vert
      const bleuOcean: [number, number, number] = [46, 92, 138]; // Bleu

      // Logo en haut à gauche
      try {
        doc.addImage('assets/logo.png', 'PNG', 15, 10, 40, 40);
      } catch (e) {
        console.log('Logo non trouvé');
      }

      // Titre INVENTAIRE en haut à droite
      doc.setTextColor(...bleuOcean);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('INVENTAIRE STOCK', 195, 25, { align: 'right' });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Date: ' + new Date().toLocaleDateString('fr-FR'), 195, 35, { align: 'right' });

      // Ligne de séparation
      doc.setDrawColor(...bleuOcean);
      doc.setLineWidth(0.5);
      doc.line(15, 55, 195, 55);

      let yPosition = 65;

      // Statistiques globales
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...vertAgro);
      doc.text('STATISTIQUES GLOBALES', 15, yPosition);

      yPosition += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text('Total Produits:', 15, yPosition);
      doc.text(this.inventaire.total_produits.toString(), 70, yPosition);

      yPosition += 6;
      doc.text('Quantité Totale:', 15, yPosition);
      doc.text(this.inventaire.quantite_totale.toString() + ' unités', 70, yPosition);

      yPosition += 6;
      doc.text('Valeur Totale:', 15, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...bleuOcean);
      doc.text(this.formatCurrencyForPDF(this.inventaire.valeur_totale), 70, yPosition);

      yPosition += 12;

      // Tableau par entrepôt
      if (this.inventaire.par_entrepot && this.inventaire.par_entrepot.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...vertAgro);
        doc.text('RÉPARTITION PAR ENTREPÔT', 15, yPosition);

        yPosition += 8;

        const entrepotData: any[] = [];
        this.inventaire.par_entrepot.forEach((item: any) => {
          entrepotData.push([
            item.entrepot,
            item.nombre_produits.toString(),
            item.quantite_totale.toString(),
            this.formatCurrencyForPDF(item.valeur_totale)
          ]);
        });

        autoTable(doc, {
          startY: yPosition,
          head: [['Entrepôt', 'Produits', 'Quantité', 'Valeur Totale']],
          body: entrepotData,
          theme: 'striped',
          headStyles: {
            fillColor: bleuOcean,
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center'
          },
          styles: {
            fontSize: 9,
            cellPadding: 3
          },
          columnStyles: {
            0: { halign: 'left' },
            1: { halign: 'center' },
            2: { halign: 'center' },
            3: { halign: 'right', fontStyle: 'bold' }
          }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }

      // Tableau par catégorie
      if (this.inventaire.par_categorie && this.inventaire.par_categorie.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...vertAgro);
        doc.text('RÉPARTITION PAR CATÉGORIE', 15, yPosition);

        yPosition += 8;

        const categorieData: any[] = [];
        this.inventaire.par_categorie.forEach((item: any) => {
          categorieData.push([
            item.categorie,
            item.nombre_produits.toString(),
            item.quantite_totale.toString(),
            this.formatCurrencyForPDF(item.valeur_totale)
          ]);
        });

        autoTable(doc, {
          startY: yPosition,
          head: [['Catégorie', 'Produits', 'Quantité', 'Valeur Totale']],
          body: categorieData,
          theme: 'striped',
          headStyles: {
            fillColor: bleuOcean,
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center'
          },
          styles: {
            fontSize: 9,
            cellPadding: 3
          },
          columnStyles: {
            0: { halign: 'left' },
            1: { halign: 'center' },
            2: { halign: 'center' },
            3: { halign: 'right', fontStyle: 'bold' }
          }
        });
      }

      // Pied de page
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(128, 128, 128);
      doc.text('AGROCEAN - Terre & Mer Durables', 105, 280, { align: 'center' });

      // Télécharger le PDF
      doc.save(`Inventaire_Stock_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`);

      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Export PDF réussi'
      });
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors de la génération du PDF'
      });
    }
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