// src/app/features/finances/factures-fournisseurs-list/factures-fournisseurs-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FactureFournisseurService } from '../../../core/services/facture-fournisseur.service';
import { FactureFournisseur } from '../../../core/models';
import { MessageService } from 'primeng/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

    // Récupérer les détails complets de la facture
    this.factureFournisseurService.getById(facture.id).subscribe({
      next: (factureComplete: any) => {
        console.log('📄 Facture fournisseur complète:', factureComplete);

        // Laravel peut retourner en snake_case ou camelCase
        const commandeAchat = factureComplete.commandeAchat || factureComplete.commande_achat;
        console.log('🛒 Commande achat:', commandeAchat);

        const details = commandeAchat?.detailCommandeAchats || commandeAchat?.detail_commande_achats;
        console.log('📦 Détails commande:', details);

        try {
          // Créer un objet normalisé avec la bonne structure
          const factureNormalized = {
            ...factureComplete,
            commandeAchat: commandeAchat
          };

          const pdf = this.genererPDFDocument(factureNormalized);
          pdf.save(`facture-fournisseur-${factureComplete.numero}.pdf`);

          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Facture téléchargée avec succès'
          });
        } catch (error) {
          console.error('Erreur génération PDF:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors de la génération du PDF'
          });
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des données'
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

    // Récupérer les détails complets de la facture
    this.factureFournisseurService.getById(facture.id).subscribe({
      next: (factureComplete) => {
        try {
          const pdf = this.genererPDFDocument(factureComplete);

          // Ouvrir le PDF dans une nouvelle fenêtre pour impression
          const blob = pdf.output('blob');
          const url = window.URL.createObjectURL(blob);
          const printWindow = window.open(url, '_blank');

          if (printWindow) {
            printWindow.addEventListener('load', () => {
              printWindow.print();
            });
          }

          setTimeout(() => window.URL.revokeObjectURL(url), 100);
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors de la génération du PDF'
          });
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des données'
        });
      }
    });
  }

  private genererPDFDocument(facture: FactureFournisseur): jsPDF {
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

    // Titre FACTURE FOURNISSEUR en haut à droite
    doc.setTextColor(...bleuOcean);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE', 195, 22, { align: 'right' });
    doc.text('FOURNISSEUR', 195, 30, { align: 'right' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(facture.numero, 195, 38, { align: 'right' });

    // Ligne de séparation
    doc.setDrawColor(...bleuOcean);
    doc.setLineWidth(0.5);
    doc.line(15, 55, 195, 55);

    // Informations FOURNISSEUR (gauche)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...vertAgro);
    doc.text('FOURNISSEUR', 15, 65);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(facture.fournisseur?.nom || 'N/A', 15, 72);
    doc.setFontSize(9);
    if (facture.fournisseur?.adresse) {
      doc.text(facture.fournisseur.adresse, 15, 78);
    }
    if (facture.fournisseur?.telephone) {
      doc.text('Tel: ' + facture.fournisseur.telephone, 15, 84);
    }

    // Informations FACTURE (droite)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...vertAgro);
    doc.text('Date émission:', 120, 65);
    doc.text('Date échéance:', 120, 72);
    doc.text('Statut:', 120, 79);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(new Date(facture.date_emission).toLocaleDateString('fr-FR'), 160, 65);
    doc.text(new Date(facture.date_echeance).toLocaleDateString('fr-FR'), 160, 72);
    doc.text(facture.statut, 160, 79);

    // Tableau produits - GÉRER LES DEUX NOTATIONS
    const tableData: any[] = [];

    // Récupérer commandeAchat (peut être camelCase ou snake_case)
    const commandeAchat = (facture as any).commandeAchat || (facture as any).commande_achat;

    // Récupérer les détails (peut être camelCase ou snake_case)
    let details = commandeAchat?.detailCommandeAchats || commandeAchat?.detail_commande_achats;

    if (details && details.length > 0) {
      details.forEach((detail: any) => {
        tableData.push([
          detail.produit?.nom || 'N/A',
          detail.quantite.toString(),
          this.formatCurrency(detail.prix_unitaire),
          this.formatCurrency(detail.sous_total || (detail.quantite * detail.prix_unitaire))
        ]);
      });
    }

    autoTable(doc, {
      startY: 95,
      head: [['Produit', 'Quantité', 'Prix Unitaire', 'Total']],
      body: tableData,
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
        0: { halign: 'left', cellWidth: 80 },
        1: { halign: 'center', cellWidth: 25 },
        2: { halign: 'right', cellWidth: 35 },
        3: { halign: 'right', cellWidth: 35, fontStyle: 'bold' }
      }
    });

    // Totaux
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setDrawColor(...bleuOcean);
    doc.setLineWidth(0.5);
    doc.line(120, finalY, 195, finalY);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...vertAgro);
    doc.text('Total:', 120, finalY + 8);
    doc.setFontSize(14);
    doc.setTextColor(...bleuOcean);
    doc.text(this.formatCurrency(facture.montant_total), 195, finalY + 8, { align: 'right' });

    const montantPaye = facture.montant_paye || 0;
    const montantRestant = facture.montant_restant || (facture.montant_total - montantPaye);

    if (montantPaye > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text('Montant payé:', 120, finalY + 16);
      doc.text(this.formatCurrency(montantPaye), 195, finalY + 16, { align: 'right' });

      doc.text('Montant restant:', 120, finalY + 23);
      doc.setFont('helvetica', 'bold');
      doc.text(this.formatCurrency(montantRestant), 195, finalY + 23, { align: 'right' });
    }

    // Pied de page
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128, 128, 128);
    doc.text('Merci pour votre collaboration', 105, 280, { align: 'center' });
    doc.text('AGROCEAN - Terre & Mer Durables', 105, 285, { align: 'center' });

    return doc;
  }
}
