import { Component, OnInit } from '@angular/core';
import { RapportService } from '../../../core/services/all-services';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-rapport-stocks',
  templateUrl: './rapport-stocks.component.html',
  styleUrls: ['./rapport-stocks.component.scss']
})
export class RapportStocksComponent implements OnInit {
  rapport: any = null;
  loading = false;

  chartCategorie: any;
  chartEntrepot: any;

  constructor(
    private rapportService: RapportService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.generer();
  }

  generer(): void {
    this.loading = true;
    this.rapportService.rapportStocks().subscribe({
      next: (data) => {
        this.rapport = data;
        this.prepareCharts();
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

  prepareCharts(): void {
    // Graphique par catégorie
    if (this.rapport.stock_par_categorie) {
      const categories = Object.entries(this.rapport.stock_par_categorie);
      this.chartCategorie = {
        labels: categories.map((c: any) => c[0]),
        datasets: [{
          data: categories.map((c: any) => c[1].valeur),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40'
          ]
        }]
      };
    }

    // Graphique par entrepôt
    if (this.rapport.stock_par_entrepot) {
      const entrepots = Object.values(this.rapport.stock_par_entrepot);
      this.chartEntrepot = {
        labels: entrepots.map((e: any) => e.entrepot),
        datasets: [{
          label: 'Capacité Utilisée (%)',
          data: entrepots.map((e: any) => e.capacite_utilisee),
          backgroundColor: '#36A2EB'
        }]
      };
    }
  }

  formatCurrency(value: any): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0 FCFA';
    return numValue.toLocaleString('fr-FR') + ' FCFA';
  }

  getPieOptions(): any {
    return {
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const value = this.formatCurrency(context.parsed);
              return label + ': ' + value;
            }
          }
        }
      }
    };
  }

  getBarOptions(): any {
    return {
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (value: any) => value + '%'
          }
        }
      }
    };
  }
}
