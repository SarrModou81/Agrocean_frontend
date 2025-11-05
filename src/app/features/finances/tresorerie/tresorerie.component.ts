import { Component, OnInit } from '@angular/core';
import { FinanceService } from '../../../core/services/finance.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-tresorerie',
  template: `
    <div class="tresorerie-container">
      <p-card>
        <div class="header-section">
          <h2>État de la Trésorerie</h2>
          <div class="filters">
            <p-calendar 
              [(ngModel)]="dateDebut"
              [showIcon]="true"
              dateFormat="dd/mm/yy"
              placeholder="Date début"
            ></p-calendar>
            <p-calendar 
              [(ngModel)]="dateFin"
              [showIcon]="true"
              dateFormat="dd/mm/yy"
              placeholder="Date fin"
            ></p-calendar>
            <button 
              pButton 
              icon="pi pi-refresh" 
              label="Actualiser"
              (click)="loadTresorerie()"
              [loading]="loading"
            ></button>
          </div>
        </div>

        <div *ngIf="loading" class="loading-section">
          <p-progressBar mode="indeterminate"></p-progressBar>
        </div>

        <div *ngIf="!loading && tresorerie" class="content">
          <div class="stat-grid">
            <p-card class="stat-card stat-success">
              <div class="stat-content">
                <div class="stat-icon">
                  <i class="pi pi-arrow-up"></i>
                </div>
                <div class="stat-details">
                  <h3>Encaissements</h3>
                  <p class="value">{{ formatCurrency(tresorerie.encaissements) }}</p>
                </div>
              </div>
            </p-card>

            <p-card class="stat-card stat-danger">
              <div class="stat-content">
                <div class="stat-icon">
                  <i class="pi pi-arrow-down"></i>
                </div>
                <div class="stat-details">
                  <h3>Décaissements</h3>
                  <p class="value">{{ formatCurrency(tresorerie.decaissements) }}</p>
                </div>
              </div>
            </p-card>

            <p-card class="stat-card stat-primary">
              <div class="stat-content">
                <div class="stat-icon">
                  <i class="pi pi-wallet"></i>
                </div>
                <div class="stat-details">
                  <h3>Solde</h3>
                  <p class="value">{{ formatCurrency(tresorerie.solde) }}</p>
                </div>
              </div>
            </p-card>

            <p-card class="stat-card stat-warning">
              <div class="stat-content">
                <div class="stat-icon">
                  <i class="pi pi-clock"></i>
                </div>
                <div class="stat-details">
                  <h3>Créances Clients</h3>
                  <p class="value">{{ formatCurrency(tresorerie.creances_clients) }}</p>
                </div>
              </div>
            </p-card>

            <p-card class="stat-card stat-info">
              <div class="stat-content">
                <div class="stat-icon">
                  <i class="pi pi-credit-card"></i>
                </div>
                <div class="stat-details">
                  <h3>Dettes Fournisseurs</h3>
                  <p class="value">{{ formatCurrency(tresorerie.dettes_fournisseurs) }}</p>
                </div>
              </div>
            </p-card>

            <p-card class="stat-card stat-secondary">
              <div class="stat-content">
                <div class="stat-icon">
                  <i class="pi pi-chart-bar"></i>
                </div>
                <div class="stat-details">
                  <h3>Trésorerie Nette</h3>
                  <p class="value">{{ formatCurrency(tresorerie.tresorerie_nette) }}</p>
                </div>
              </div>
            </p-card>
          </div>

          <!-- Évolution quotidienne -->
          <div class="evolution-section" *ngIf="tresorerie.evolution_quotidienne && tresorerie.evolution_quotidienne.length > 0">
            <p-card header="Évolution Quotidienne">
              <p-chart type="line" [data]="chartData" [options]="chartOptions" height="300px"></p-chart>
            </p-card>
          </div>

          <!-- Tableau détaillé -->
          <div class="details-section">
            <p-card header="Détails par Jour">
              <p-table 
                [value]="tresorerie.evolution_quotidienne || []" 
                [paginator]="true" 
                [rows]="10"
                responsiveLayout="scroll"
              >
                <ng-template pTemplate="header">
                  <tr>
                    <th>Date</th>
                    <th>Encaissements</th>
                    <th>Décaissements</th>
                    <th>Solde</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-jour>
                  <tr>
                    <td>{{ jour.date | date:'dd/MM/yyyy' }}</td>
                    <td class="success">{{ formatCurrency(jour.encaissements) }}</td>
                    <td class="danger">{{ formatCurrency(jour.decaissements) }}</td>
                    <td [class]="jour.solde >= 0 ? 'success' : 'danger'">
                      {{ formatCurrency(jour.solde) }}
                    </td>
                  </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="4" class="text-center">Aucune donnée disponible</td>
                  </tr>
                </ng-template>
              </p-table>
            </p-card>
          </div>
        </div>
      </p-card>
    </div>
    <p-toast></p-toast>
  `,
  styles: [`
    .tresorerie-container {
      .header-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        gap: 1rem;

        h2 {
          margin: 0;
          color: #495057;
          font-size: 1.75rem;
          font-weight: 700;
        }

        .filters {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
      }

      .loading-section {
        margin: 2rem 0;
      }

      .content { 
        padding: 0;
      }

      .stat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .stat-card {
        ::ng-deep .p-card-body {
          padding: 1.5rem;
        }

        .stat-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .stat-icon {
          font-size: 2.5rem;
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.2);
        }

        .stat-details {
          flex: 1;

          h3 {
            margin: 0 0 0.5rem 0;
            font-size: 0.875rem;
            opacity: 0.9;
          }

          .value {
            font-size: 1.5rem;
            font-weight: 700;
            margin: 0;
          }
        }

        &.stat-success {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          color: white;
        }

        &.stat-danger {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        &.stat-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        &.stat-warning {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          color: white;
        }

        &.stat-info {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
        }

        &.stat-secondary {
          background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
          color: #495057;
        }
      }

      .evolution-section,
      .details-section {
        margin-top: 2rem;
      }

      .success {
        color: #43e97b;
        font-weight: 600;
      }

      .danger {
        color: #f5576c;
        font-weight: 600;
      }
    }

    @media (max-width: 768px) {
      .tresorerie-container {
        .header-section {
          flex-direction: column;
          align-items: flex-start;

          .filters {
            width: 100%;
            flex-direction: column;
          }
        }

        .stat-grid {
          grid-template-columns: 1fr;
        }
      }
    }
  `]
})
export class TresorerieComponent implements OnInit {
  tresorerie: any = null;
  loading = false;
  dateDebut: Date | null = null;
  dateFin: Date | null = null;
  chartData: any;
  chartOptions: any;

  constructor(
    private financeService: FinanceService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Définir les dates par défaut (début et fin du mois en cours)
    const now = new Date();
    this.dateDebut = new Date(now.getFullYear(), now.getMonth(), 1);
    this.dateFin = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    this.initChartOptions();
    this.loadTresorerie();
  }

  initChartOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary,
            callback: function(value: any) {
              return (value / 1000).toFixed(0) + 'k FCFA';
            }
          },
          grid: {
            color: surfaceBorder
          }
        },
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        }
      }
    };
  }

  loadTresorerie(): void {
    this.loading = true;
    
    const params: any = {};
    if (this.dateDebut) {
      params.date_debut = this.formatDate(this.dateDebut);
    }
    if (this.dateFin) {
      params.date_fin = this.formatDate(this.dateFin);
    }

    this.financeService.etatTresorerie(params).subscribe({
      next: (data) => {
        this.tresorerie = data;
        this.prepareChart();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur trésorerie:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement de la trésorerie'
        });
        this.loading = false;
      }
    });
  }

  prepareChart(): void {
    if (!this.tresorerie || !this.tresorerie.evolution_quotidienne) return;

    const evolution = this.tresorerie.evolution_quotidienne;
    
    this.chartData = {
      labels: evolution.map((e: any) => new Date(e.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })),
      datasets: [
        {
          label: 'Encaissements',
          data: evolution.map((e: any) => e.encaissements),
          borderColor: '#43e97b',
          backgroundColor: 'rgba(67, 233, 123, 0.2)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Décaissements',
          data: evolution.map((e: any) => e.decaissements),
          borderColor: '#f5576c',
          backgroundColor: 'rgba(245, 87, 108, 0.2)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Solde',
          data: evolution.map((e: any) => e.solde),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  }

  formatCurrency(value: number | undefined): string {
    if (value === undefined || value === null) return '0 FCFA';
    return value.toLocaleString('fr-FR') + ' FCFA';
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }
}