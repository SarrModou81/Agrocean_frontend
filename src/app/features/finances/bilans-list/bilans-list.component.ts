import { Component, OnInit } from '@angular/core';
import { FinanceService } from '../../../core/services/all-services';
import { BilanFinancier } from '../../../core/models';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-bilans-list',
  template: `
    <div class="bilans-container">
      <p-card header="Bilans Financiers">
        <p-table [value]="bilans" [loading]="loading" [paginator]="true" [rows]="10">
          <ng-template pTemplate="header">
            <tr>
              <th>Période</th>
              <th>Chiffre d'Affaires</th>
              <th>Charges</th>
              <th>Bénéfice Net</th>
              <th>Marge Globale</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-bilan>
            <tr>
              <td><strong>{{ bilan.periode }}</strong></td>
              <td>{{ formatCurrency(bilan.chiffre_affaires) }}</td>
              <td>{{ formatCurrency(bilan.charges_exploitation) }}</td>
              <td>
                <span [class]="bilan.benefice_net >= 0 ? 'positive' : 'negative'">
                  {{ formatCurrency(bilan.benefice_net) }}
                </span>
              </td>
              <td>{{ bilan.marge_globale.toFixed(2) }}%</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `,
  styles: [`
    .bilans-container {
      padding: 0;
      .positive { color: #43e97b; font-weight: 600; }
      .negative { color: #f5576c; font-weight: 600; }
    }
  `]
})
export class BilansListComponent implements OnInit {
  bilans: BilanFinancier[] = [];
  loading = false;

  constructor(
    private financeService: FinanceService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.financeService.getAll().subscribe({
      next: (response) => {
        this.bilans = response.data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des bilans'
        });
        this.loading = false;
      }
    });
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }
}