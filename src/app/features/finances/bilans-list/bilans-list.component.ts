import { Component, OnInit } from '@angular/core';
import { FinanceService } from '../../../core/services/all-services';
import { BilanFinancier } from '../../../core/models';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-bilans-list',
  template: `
    <div class="bilans-container">
      <p-card header="Bilans Financiers">
        <!-- Bouton actualiser -->
        <div style="margin-bottom: 1rem;">
          <button
            pButton
            icon="pi pi-refresh"
            label="Actualiser"
            (click)="loadBilans()"
            [loading]="loading"
          ></button>
        </div>

        <!-- Table -->
        <p-table
          *ngIf="bilans && bilans.length > 0"
          [value]="bilans"
          [loading]="loading"
          [paginator]="true"
          [rows]="10"
        >
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

        <!-- État vide -->
        <div *ngIf="!loading && (!bilans || bilans.length === 0)" style="text-align: center; padding: 40px;">
          <p><i class="pi pi-inbox" style="font-size: 3rem; color: #ccc;"></i></p>
          <p style="font-size: 1.1em; color: #666;">Aucun bilan financier disponible</p>
          <p style="color: #999; font-size: 0.9em;">
            Les bilans seront générés automatiquement basés sur vos transactions financières
          </p>
        </div>
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
    this.loadBilans();
  }

  loadBilans(): void {
    this.loading = true;

    this.financeService.getAll().subscribe({
      next: (response) => {
        // Gérer différents formats de réponse
        if (response && response.data) {
          this.bilans = response.data;
        } else if (Array.isArray(response)) {
          this.bilans = response;
        } else {
          this.bilans = [];
        }

        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des bilans'
        });
        this.bilans = [];
        this.loading = false;
      }
    });
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }
}