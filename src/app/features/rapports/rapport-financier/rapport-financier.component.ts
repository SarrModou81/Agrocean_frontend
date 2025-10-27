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
          <button pButton label="Générer" (click)="generer()" [disabled]="loading"></button>
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