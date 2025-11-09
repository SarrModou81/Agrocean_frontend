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

    // Couleurs (rouge/orange pour fournisseurs)
    const primaryColor: [number, number, number] = [192, 57, 43];
    const accentColor: [number, number, number] = [46, 204, 113];

    // Fond d'en-tête rouge
    doc.setFillColor(192, 57, 43);
    doc.rect(0, 0, 210, 50, 'F');

    // Logo (à gauche)
    try {
      const logoPath = 'assets/logo.png';
      doc.addImage(logoPath, 'PNG', 15, 10, 35, 35);
    } catch (e) {
      console.log('Logo non trouvé');
    }

    // Informations entreprise
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('AGROCEAN', 55, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Gestion & Distribution Agro-alimentaire', 55, 28);
    doc.text('📍 Dakar, Sénégal', 55, 34);
    doc.text('📞 +221 33 XXX XX XX', 55, 40);
    doc.text('✉ contact@agrocean.sn', 55, 46);

    // FACTURE FOURNISSEUR (à droite)
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE', 210, 20, { align: 'right' });
    doc.text('FOURNISSEUR', 210, 28, { align: 'right' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(facture.numero, 210, 36, { align: 'right' });

    // Retour couleur normale
    doc.setTextColor(0, 0, 0);

    // Ligne séparation
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1);
    doc.line(15, 55, 195, 55);

    // Cadre FOURNISSEUR (gauche)
    doc.setFillColor(254, 245, 244);
    doc.roundedRect(15, 62, 85, 40, 3, 3, 'F');
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, 62, 85, 40, 3, 3, 'S');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('FOURNISSEUR', 20, 70);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(facture.fournisseur?.nom || 'N/A', 20, 78);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    if (facture.fournisseur?.adresse) {
      doc.text('📍 ' + facture.fournisseur.adresse, 20, 85);
    }
    if (facture.fournisseur?.telephone) {
      doc.text('📞 ' + facture.fournisseur.telephone, 20, 91);
    }

    // Cadre DÉTAILS (droite)
    doc.setFillColor(254, 245, 244);
    doc.roundedRect(110, 62, 85, 40, 3, 3, 'F');
    doc.setDrawColor(...primaryColor);
    doc.roundedRect(110, 62, 85, 40, 3, 3, 'S');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('DÉTAILS FACTURE', 115, 70);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text('Date émission: ' + new Date(facture.date_emission).toLocaleDateString('fr-FR'), 115, 78);
    doc.text('Date échéance: ' + new Date(facture.date_echeance).toLocaleDateString('fr-FR'), 115, 84);

    // Badge statut
    let badgeColor: [number, number, number];
    switch(facture.statut) {
      case 'Payée': badgeColor = [46, 204, 113]; break;
      case 'Partiellement Payée': badgeColor = [243, 156, 18]; break;
      case 'Impayée': badgeColor = [231, 76, 60]; break;
      default: badgeColor = [149, 165, 166];
    }
    doc.setFillColor(...badgeColor);
    doc.roundedRect(115, 89, 35, 8, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(facture.statut, 132.5, 94.5, { align: 'center' });

    doc.setTextColor(0, 0, 0);

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
      startY: 110,
      head: [['Produit', 'Qté', 'Prix Unit.', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 9,
        cellPadding: 5
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
      },
      alternateRowStyles: {
        fillColor: [254, 245, 244]
      }
    });

    // Totaux
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFillColor(254, 245, 244);
    doc.roundedRect(115, finalY - 5, 80, 40, 3, 3, 'F');
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(115, finalY - 5, 80, 40, 3, 3, 'S');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Total:', 120, finalY + 2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.text(this.formatCurrency(facture.montant_total), 190, finalY + 2, { align: 'right' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    const montantPaye = facture.montant_paye || 0;
    const montantRestant = facture.montant_restant || (facture.montant_total - montantPaye);

    if (montantPaye > 0) {
      doc.setFont('helvetica', 'normal');
      doc.text('Payé:', 120, finalY + 12);
      doc.setTextColor(...accentColor);
      doc.text(this.formatCurrency(montantPaye), 190, finalY + 12, { align: 'right' });

      doc.setTextColor(0, 0, 0);
      doc.text('Restant:', 120, finalY + 22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(231, 76, 60);
      doc.text(this.formatCurrency(montantRestant), 190, finalY + 22, { align: 'right' });
    }

    // Pied de page
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(15, 270, 195, 270);

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Merci pour votre collaboration !', 105, 276, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Document généré le ' + new Date().toLocaleString('fr-FR'), 105, 282, { align: 'center' });
    doc.text('AGROCEAN © ' + new Date().getFullYear() + ' - Tous droits réservés', 105, 287, { align: 'center' });

    return doc;
  }
}
