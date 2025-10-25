import { Component, OnInit } from '@angular/core';
import { FactureService } from '../../../core/services/all-services';
import { Facture } from '../../../core/models';
import { MessageService } from 'primeng/api';

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
              <td>{{ formatCurrency(facture.montant_restant || facture.montant_ttc) }}</td>
              <td>
                <p-tag [value]="facture.statut" [severity]="getStatutSeverity(facture.statut)"></p-tag>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
    <p-toast></p-toast>
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
}