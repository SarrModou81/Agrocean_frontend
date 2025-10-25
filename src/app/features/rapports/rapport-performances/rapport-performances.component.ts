import { Component } from '@angular/core';
import { RapportService } from '../../../core/services/all-services';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-rapport-performances',
  template: `
    <div class="rapport-container">
      <p-card header="Analyse des Performances">
        <button pButton label="Générer" (click)="generer()" [loading]="loading" class="p-button-primary"></button>
        <div *ngIf="rapport" class="stats-grid">
          <div class="stat-card">
            <h4>Taux de rotation des stocks</h4>
            <p class="value">{{ rapport.taux_rotation?.toFixed(2) || 0 }}%</p>
          </div>
          <div class="stat-card">
            <h4>Marge moyenne</h4>
            <p class="value">{{ rapport.marge_moyenne?.toFixed(2) || 0 }}%</p>
          </div>
          <div class="stat-card">
            <h4>Taux de satisfaction client</h4>
            <p class="value">{{ rapport.taux_satisfaction?.toFixed(2) || 0 }}%</p>
          </div>
          <div class="stat-card">
            <h4>Délai moyen de livraison</h4>
            <p class="value">{{ rapport.delai_moyen || 0 }} jours</p>
          </div>
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
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
          h4 {
            margin: 0 0 1rem 0;
            font-size: 0.9rem;
            opacity: 0.9;
          }
          .value {
            font-size: 2rem;
            font-weight: 700;
            margin: 0;
          }
        }
      }
    }
    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr !important;
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
          detail: 'Erreur lors de la génération du rapport'
        });
        this.loading = false;
      }
    });
  }
}