import { Component } from '@angular/core';
import { RapportService } from '../../../core/services/all-services';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-rapport-ventes',
  template: `
    <div class="rapport-container">
      <p-card header="Rapport des Ventes">
        <button pButton label="Générer" (click)="generer()" [disabled]="loading" class="p-button-primary"></button>
        <div *ngIf="rapport" class="content">
          <h3>Total des ventes: {{ formatCurrency(rapport.total) }}</h3>
          <p-chart type="line" [data]="chartData" height="300px"></p-chart>
        </div>
        <p-progressBar *ngIf="loading" mode="indeterminate"></p-progressBar>
      </p-card>
    </div>
    <p-toast></p-toast>
  `,
  styles: [`
    .rapport-container {
      padding: 0;
      button { margin-bottom: 1.5rem; }
      .content {
        padding-top: 1rem;
        h3 {
          margin: 0 0 1rem 0;
          color: #495057;
          font-weight: 600;
        }
      }
    }
  `]
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
        label: 'Ventes (FCFA)',
        data: this.rapport.evolution?.map((e: any) => e.montant) || [],
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        tension: 0.4
      }]
    };
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }
}