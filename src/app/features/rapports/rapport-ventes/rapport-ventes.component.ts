import { Component, OnInit } from '@angular/core';
import { RapportService } from '../../../core/services/all-services';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-rapport-ventes',
  templateUrl: './rapport-ventes.component.html',
  styleUrls: ['./rapport-ventes.component.scss']
})
export class RapportVentesComponent implements OnInit {
  rapport: any = null;
  loading = false;
  dateDebut: Date | null = null;
  dateFin: Date | null = null;

  chartTendances: any;

  constructor(
    private rapportService: RapportService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Charger le rapport du mois en cours par défaut
    const now = new Date();
    this.dateDebut = new Date(now.getFullYear(), now.getMonth(), 1);
    this.dateFin = now;
    this.generer();
  }

  generer(): void {
    this.loading = true;
    const params: any = {};
    if (this.dateDebut) params.date_debut = this.formatDate(this.dateDebut);
    if (this.dateFin) params.date_fin = this.formatDate(this.dateFin);

    this.rapportService.rapportVentes(params).subscribe({
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
    if (this.rapport.tendances) {
      const tendances = Object.entries(this.rapport.tendances);
      this.chartTendances = {
        labels: tendances.map((t: any) => {
          const date = new Date(t[0]);
          return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }),
        datasets: [
          {
            label: 'Nombre de Ventes',
            data: tendances.map((t: any) => t[1].nombre),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4,
            fill: false,
            yAxisID: 'y'
          },
          {
            label: 'Montant (FCFA)',
            data: tendances.map((t: any) => t[1].montant),
            borderColor: '#11998e',
            backgroundColor: 'rgba(17, 153, 142, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y1'
          }
        ]
      };
    }
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatCurrency(value: any): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0 FCFA';
    return numValue.toLocaleString('fr-FR') + ' FCFA';
  }

  getLineOptions(): any {
    return {
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              if (context.datasetIndex === 1) {
                return context.dataset.label + ': ' + this.formatCurrency(context.parsed.y);
              }
              return context.dataset.label + ': ' + context.parsed.y;
            }
          }
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Nombre de Ventes'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Montant (FCFA)'
          },
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            callback: (value: any) => {
              return (value / 1000) + 'K';
            }
          }
        }
      }
    };
  }
}
