import { Component, OnInit } from '@angular/core';
import { FinanceService } from '../../../core/services/all-services';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-tresorerie',
  template: `
    <div class="tresorerie-container">
      <p-card header="État de la Trésorerie">
        <div *ngIf="!loading && tresorerie" class="content">
          <div class="stat-grid">
            <div class="stat-item">
              <h3>Solde Disponible</h3>
              <p class="value">{{ formatCurrency(tresorerie.solde_disponible) }}</p>
            </div>
            <div class="stat-item">
              <h3>Encaissements</h3>
              <p class="value success">{{ formatCurrency(tresorerie.encaissements) }}</p>
            </div>
            <div class="stat-item">
              <h3>Décaissements</h3>
              <p class="value danger">{{ formatCurrency(tresorerie.decaissements) }}</p>
            </div>
          </div>
        </div>
        <p-progressBar *ngIf="loading" mode="indeterminate"></p-progressBar>
      </p-card>
    </div>
    <p-toast></p-toast>
  `,
  styles: [`
    .tresorerie-container {
      .content { padding: 1rem; }
      .stat-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
      }
      .stat-item {
        text-align: center;
        padding: 1.5rem;
        background: #f8f9fa;
        border-radius: 8px;
        h3 { margin: 0 0 1rem 0; color: #6c757d; }
        .value {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          &.success { color: #43e97b; }
          &.danger { color: #f5576c; }
        }
      }
    }
  `]
})
export class TresorerieComponent implements OnInit {
  tresorerie: any = null;
  loading = false;

  constructor(
    private financeService: FinanceService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.financeService.etatTresorerie().subscribe({
      next: (data) => {
        this.tresorerie = data;
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
}