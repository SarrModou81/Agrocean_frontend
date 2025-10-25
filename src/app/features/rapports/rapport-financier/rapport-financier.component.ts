import { Component, OnInit } from '@angular/core';
import { RapportService } from '../../../core/services/all-services';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-rapport-financier',
  template: `
    <div class="rapport-container">
      <p-card header="Rapport Financier">
        <div class="filters">
          <p-calendar [(ngModel)]="dateDebut" placeholder="Date début"></p-calendar>
          <p-calendar [(ngModel)]="dateFin" placeholder="Date fin"></p-calendar>
          <button pButton label="Générer" (click)="generer()" [loading]="loading"></button>
        </div>
        <div *ngIf="rapport" class="content">
          <p-chart type="bar" [data]="chartData" height="400px"></p-chart>
        </div>
        <p-progressBar *ngIf="loading" mode="indeterminate"></p-progressBar>
      </p-card>
    </div>
    <p-toast></p-toast>
  `,
  styles: [`
    .rapport-container {
      .filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
      }
      .content { padding: 1rem; }
    }
  `]
})
export class RapportFinancierComponent implements OnInit {
  rapport: any = null;
  loading = false;
  dateDebut: Date | null = null;
  dateFin: Date | null = null;
  chartData: any;

  constructor(
    private rapportService: RapportService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {}

  generer(): void {
    this.loading = true;
    const params: any = {};
    if (this.dateDebut) params.date_debut = this.dateDebut.toISOString().split('T')[0];
    if (this.dateFin) params.date_fin = this.dateFin.toISOString().split('T')[0];

    this.rapportService.rapportFinancier(params).subscribe({
      next: (data) => {
        this.rapport = data;
        this.prepareChart();
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la génération du rapport'
        });
        this.loading = false;
      }
    });
  }

  prepareChart(): void {
    this.chartData = {
      labels: ['CA', 'Charges', 'Bénéfice'],
      datasets: [{
        label: 'Montant (FCFA)',
        data: [
          this.rapport.chiffre_affaires,
          this.rapport.charges,
          this.rapport.benefice
        ],
        backgroundColor: ['#43e97b', '#f5576c', '#667eea']
      }]
    };
  }
}

@Component({
  selector: 'app-rapport-stocks',
  template: `
    <div class="rapport-container">
      <p-card header="Rapport des Stocks">
        <button pButton label="Générer" (click)="generer()" [loading]="loading"></button>
        <div *ngIf="rapport">
          <p-table [value]="rapport.produits" [paginator]="true" [rows]="10">
            <ng-template pTemplate="header">
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Valeur</th>
                <th>Statut</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-item>
              <tr>
                <td>{{ item.nom }}</td>
                <td>{{ item.quantite }}</td>
                <td>{{ formatCurrency(item.valeur) }}</td>
                <td>
                  <p-tag 
                    [value]="item.statut" 
                    [severity]="item.quantite > item.seuil ? 'success' : 'danger'"
                  ></p-tag>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
        <p-progressBar *ngIf="loading" mode="indeterminate"></p-progressBar>
      </p-card>
    </div>
    <p-toast></p-toast>
  `,
  styles: [`.rapport-container { padding: 0; }`]
})
export class RapportStocksComponent {
  rapport: any = null;
  loading = false;

  constructor(
    private rapportService: RapportService,
    private messageService: MessageService
  ) {}

  generer(): void {
    this.loading = true;
    this.rapportService.rapportStocks().subscribe({
      next: (data) => {
        this.rapport = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la génération'
        });
        this.loading = false;
      }
    });
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }
}

@Component({
  selector: 'app-rapport-ventes',
  template: `
    <div class="rapport-container">
      <p-card header="Rapport des Ventes">
        <button pButton label="Générer" (click)="generer()" [loading]="loading"></button>
        <div *ngIf="rapport">
          <h3>Total: {{ formatCurrency(rapport.total) }}</h3>
          <p-chart type="line" [data]="chartData" height="300px"></p-chart>
        </div>
        <p-progressBar *ngIf="loading" mode="indeterminate"></p-progressBar>
      </p-card>
    </div>
    <p-toast></p-toast>
  `,
  styles: [`.rapport-container { padding: 0; h3 { margin: 1rem 0; } }`]
})
export class RapportVentesComponent {
  rapport: any = null;
  loading = false;
  chartData: any;

  constructor(
    private rapportService: RapportService,
    private messageService: MessageService
  ) {}

  generer(): void {
    this.loading = true;
    this.rapportService.rapportVentes().subscribe({
      next: (data) => {
        this.rapport = data;
        this.prepareChart();
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la génération'
        });
        this.loading = false;
      }
    });
  }

  prepareChart(): void {
    this.chartData = {
      labels: this.rapport.evolution?.map((e: any) => e.date) || [],
      datasets: [{
        label: 'Ventes',
        data: this.rapport.evolution?.map((e: any) => e.montant) || [],
        borderColor: '#667eea',
        tension: 0.4
      }]
    };
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }
}

@Component({
  selector: 'app-rapport-performances',
  template: `
    <div class="rapport-container">
      <p-card header="Analyse des Performances">
        <button pButton label="Générer" (click)="generer()" [loading]="loading"></button>
        <div *ngIf="rapport" class="stats">
          <div class="stat">
            <h4>Taux de rotation</h4>
            <p>{{ rapport.taux_rotation }}%</p>
          </div>
          <div class="stat">
            <h4>Marge moyenne</h4>
            <p>{{ rapport.marge_moyenne }}%</p>
          </div>
        </div>
        <p-progressBar *ngIf="loading" mode="indeterminate"></p-progressBar>
      </p-card>
    </div>
    <p-toast></p-toast>
  `,
  styles: [`
    .rapport-container {
      .stats {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        margin-top: 1rem;
        .stat {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
          h4 { margin: 0 0 0.5rem 0; }
          p { font-size: 1.5rem; font-weight: 700; margin: 0; }
        }
      }
    }
  `]
})
export class RapportPerformancesComponent {
  rapport: any = null;
  loading = false;

  constructor(
    private rapportService: RapportService,
    private messageService: MessageService
  ) {}

  generer(): void {
    this.loading = true;
    this.rapportService.analysePerformances().subscribe({
      next: (data) => {
        this.rapport = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la génération'
        });
        this.loading = false;
      }
    });
  }
}