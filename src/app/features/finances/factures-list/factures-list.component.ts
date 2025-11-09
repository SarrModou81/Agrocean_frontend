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

    // Couleurs du logo AGROCEAN
    const vertAgro: [number, number, number] = [91, 140, 62]; // Vert
    const bleuOcean: [number, number, number] = [46, 92, 138]; // Bleu

    // Logo en haut à gauche
    try {
      doc.addImage('assets/logo.png', 'PNG', 15, 10, 40, 40);
    } catch (e) {
      console.log('Logo non trouvé');
    }

    // Titre FACTURE en haut à droite
    doc.setTextColor(...bleuOcean);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE', 195, 25, { align: 'right' });

    // Ligne de séparation
    doc.setDrawColor(...bleuOcean);
    doc.setLineWidth(0.5);
    doc.line(15, 55, 195, 55);

    // Informations CLIENT (gauche)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...vertAgro);
    doc.text('CLIENT', 15, 65);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(facture.vente?.client?.nom || 'N/A', 15, 72);
    doc.setFontSize(9);
    if (facture.vente?.client?.adresse) {
      doc.text(facture.vente.client.adresse, 15, 78);
    }
    if (facture.vente?.client?.telephone) {
      doc.text('Tel: ' + facture.vente.client.telephone, 15, 84);
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
      startY: 95,
      head: [['Produit', 'Quantité', 'Prix Unit.', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: bleuOcean,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9
      },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right', fontStyle: 'bold' }
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
    doc.text('Total TTC:', 120, finalY + 8);
    doc.setFontSize(14);
    doc.setTextColor(...bleuOcean);
    doc.text(this.formatCurrency(facture.montant_ttc), 195, finalY + 8, { align: 'right' });

    const montantPaye = facture.montant_paye || 0;
    const montantRestant = facture.montant_restant || (facture.montant_ttc - montantPaye);

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
    doc.text('Merci pour votre confiance', 105, 280, { align: 'center' });
    doc.text('AGROCEAN - Terre & Mer Durables', 105, 285, { align: 'center' });

    return doc;
  }
}
