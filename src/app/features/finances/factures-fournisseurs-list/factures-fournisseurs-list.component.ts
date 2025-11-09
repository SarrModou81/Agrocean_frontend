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

    // En-tête
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE FOURNISSEUR', 105, 20, { align: 'center' });

    doc.setFontSize(16);
    doc.text(facture.numero, 105, 30, { align: 'center' });

    // Informations fournisseur
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Fournisseur:', 14, 45);
    doc.setFont('helvetica', 'bold');
    doc.text(facture.fournisseur?.nom || 'N/A', 14, 51);

    doc.setFont('helvetica', 'normal');
    if (facture.fournisseur?.adresse) {
      doc.text('Adresse: ' + facture.fournisseur.adresse, 14, 57);
    }
    if (facture.fournisseur?.telephone) {
      doc.text('Téléphone: ' + facture.fournisseur.telephone, 14, 63);
    }

    // Dates
    doc.text('Date d\'émission: ' + new Date(facture.date_emission).toLocaleDateString('fr-FR'), 120, 45);
    doc.text('Date d\'échéance: ' + new Date(facture.date_echeance).toLocaleDateString('fr-FR'), 120, 51);

    // Tableau des produits - GÉRER LES DEUX NOTATIONS
    const tableData: any[] = [];

    // Récupérer commandeAchat (peut être camelCase ou snake_case)
    const commandeAchat = (facture as any).commandeAchat || (facture as any).commande_achat;

    // Récupérer les détails (peut être camelCase ou snake_case)
    let details = commandeAchat?.detailCommandeAchats || commandeAchat?.detail_commande_achats;

    console.log('🔍 Commande achat dans PDF:', commandeAchat);
    console.log('🔍 Détails trouvés pour le PDF:', details);

    if (details && details.length > 0) {
      details.forEach((detail: any) => {
        tableData.push([
          detail.produit?.nom || 'N/A',
          detail.quantite,
          this.formatCurrency(detail.prix_unitaire),
          this.formatCurrency(detail.sous_total || (detail.quantite * detail.prix_unitaire))
        ]);
      });
    } else {
      console.warn('⚠️ Aucun détail de commande trouvé!');
    }

    autoTable(doc, {
      startY: 75,
      head: [['Produit', 'Quantité', 'Prix Unitaire', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [220, 53, 69] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 40, halign: 'right' }
      }
    });

    // Totaux
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Total:', 130, finalY);
    doc.text(this.formatCurrency(facture.montant_total), 190, finalY, { align: 'right' });

    // Informations de paiement
    const montantPaye = facture.montant_paye || 0;
    const montantRestant = facture.montant_restant || (facture.montant_total - montantPaye);

    if (montantPaye > 0) {
      doc.setFont('helvetica', 'normal');
      doc.text('Montant payé:', 130, finalY + 7);
      doc.text(this.formatCurrency(montantPaye), 190, finalY + 7, { align: 'right' });

      doc.text('Montant restant:', 130, finalY + 14);
      doc.setFont('helvetica', 'bold');
      doc.text(this.formatCurrency(montantRestant), 190, finalY + 14, { align: 'right' });
    }

    // Statut
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Statut: ' + facture.statut, 14, finalY + 20);

    // Pied de page
    doc.setFontSize(8);
    doc.text('Document généré le ' + new Date().toLocaleDateString('fr-FR'), 105, 280, { align: 'center' });

    return doc;
  }
}
