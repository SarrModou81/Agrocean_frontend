import { Component, OnInit } from '@angular/core';
import { FactureService } from '../../../core/services/all-services';
import { Facture } from '../../../core/models';
import { MessageService } from 'primeng/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-factures-list',
  template: `
    <div class="factures-container">
      <p-card>
        <div class="header-section">
          <h2>Gestion des Factures</h2>
        </div>

        <p-table
          [value]="factures"
          [loading]="loading"
          [paginator]="true"
          [rows]="20"
          responsiveLayout="scroll"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Numéro</th>
              <th>Client</th>
              <th>Date Émission</th>
              <th>Date Échéance</th>
              <th>Montant</th>
              <th>Payé</th>
              <th>Restant</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-facture>
            <tr>
              <td><code>{{ facture.numero }}</code></td>
              <td>{{ facture.vente?.client?.nom }}</td>
              <td>{{ facture.date_emission | date:'dd/MM/yyyy' }}</td>
              <td>{{ facture.date_echeance | date:'dd/MM/yyyy' }}</td>
              <td>{{ formatCurrency(facture.montant_ttc) }}</td>
              <td>{{ formatCurrency(facture.montant_paye || 0) }}</td>
              <td>{{ facture.montant_restant || (facture.montant_ttc - facture.montant_paye) }}</td>              <td>
                <p-tag [value]="facture.statut" [severity]="getStatutSeverity(facture.statut)"></p-tag>
              </td>
              <td>
                <button
                  pButton
                  icon="pi pi-download"
                  class="p-button-text p-button-info p-button-sm"
                  (click)="downloadPDF(facture)"
                  pTooltip="Télécharger PDF"
                ></button>
                <button
                  pButton
                  icon="pi pi-print"
                  class="p-button-text p-button-secondary p-button-sm"
                  (click)="printFacture(facture)"
                  pTooltip="Imprimer"
                ></button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `,
  styles: [`
    .factures-container {
      .header-section {
        margin-bottom: 2rem;
        h2 {
          margin: 0;
          color: #495057;
          font-size: 1.75rem;
          font-weight: 700;
        }
      }
      code {
        background: #e9ecef;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
      }
    }
  `]
})
export class FacturesListComponent implements OnInit {
  factures: Facture[] = [];
  loading = false;

  constructor(
    private factureService: FactureService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadFactures();
  }

  loadFactures(): void {
    this.loading = true;
    this.factureService.getAll().subscribe({
      next: (response) => {
        this.factures = response.data;
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

  downloadPDF(facture: Facture): void {
    if (!facture.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'ID de facture invalide'
      });
      return;
    }

    this.factureService.getById(facture.id).subscribe({
      next: (factureComplete: any) => {
        try {
          const pdf = this.genererPDFDocument(factureComplete);
          pdf.save(`facture-${factureComplete.numero}.pdf`);

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

  printFacture(facture: Facture): void {
    if (!facture.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'ID de facture invalide'
      });
      return;
    }

    this.factureService.getById(facture.id).subscribe({
      next: (factureComplete: any) => {
        try {
          const pdf = this.genererPDFDocument(factureComplete);
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

  private genererPDFDocument(facture: any): jsPDF {
    const doc = new jsPDF();

    // Couleurs
    const primaryColor: [number, number, number] = [41, 128, 185];
    const accentColor: [number, number, number] = [46, 204, 113];

    // Fond d'en-tête avec dégradé simulé
    doc.setFillColor(41, 128, 185);
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

    // FACTURE (à droite)
    doc.setFontSize(30);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE', 210, 22, { align: 'right' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(facture.numero, 210, 32, { align: 'right' });

    // Retour couleur normale
    doc.setTextColor(0, 0, 0);

    // Ligne séparation
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1);
    doc.line(15, 55, 195, 55);

    // Cadre CLIENT (gauche)
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(15, 62, 85, 40, 3, 3, 'F');
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, 62, 85, 40, 3, 3, 'S');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('CLIENT', 20, 70);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(facture.vente?.client?.nom || 'N/A', 20, 78);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    if (facture.vente?.client?.adresse) {
      doc.text('📍 ' + facture.vente.client.adresse, 20, 85);
    }
    if (facture.vente?.client?.telephone) {
      doc.text('📞 ' + facture.vente.client.telephone, 20, 91);
    }
    if (facture.vente?.client?.email) {
      doc.text('✉ ' + facture.vente.client.email, 20, 97);
    }

    // Cadre DÉTAILS (droite)
    doc.setFillColor(245, 247, 250);
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

    // Tableau produits
    const tableData: any[] = [];
    const vente = facture.vente;
    const details = vente?.detail_ventes || vente?.detailVentes;

    if (details && details.length > 0) {
      details.forEach((detail: any) => {
        tableData.push([
          detail.produit?.nom || 'N/A',
          detail.quantite.toString(),
          this.formatCurrency(detail.prix_unitaire),
          this.formatCurrency(detail.prix_total || (detail.quantite * detail.prix_unitaire))
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
        fillColor: [250, 250, 250]
      }
    });

    // Totaux
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFillColor(245, 247, 250);
    doc.roundedRect(115, finalY - 5, 80, 40, 3, 3, 'F');
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(115, finalY - 5, 80, 40, 3, 3, 'S');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Total TTC:', 120, finalY + 2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.text(this.formatCurrency(facture.montant_ttc), 190, finalY + 2, { align: 'right' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    const montantPaye = facture.montant_paye || 0;
    const montantRestant = facture.montant_restant || (facture.montant_ttc - montantPaye);

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
    doc.text('Merci pour votre confiance !', 105, 276, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Document généré le ' + new Date().toLocaleString('fr-FR'), 105, 282, { align: 'center' });
    doc.text('AGROCEAN © ' + new Date().getFullYear() + ' - Tous droits réservés', 105, 287, { align: 'center' });

    return doc;
  }
}
