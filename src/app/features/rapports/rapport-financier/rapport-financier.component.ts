import { Component, OnInit } from '@angular/core';
import { RapportService } from '../../../core/services/all-services';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-rapport-financier',
  templateUrl: './rapport-financier.component.html',
  styleUrls: ['./rapport-financier.component.scss']
})
export class RapportFinancierComponent implements OnInit {
  rapport: any = null;
  loading = false;
  dateDebut: Date | null = null;
  dateFin: Date | null = null;

  chartEvolution: any;
  chartRepartition: any;

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

    this.rapportService.rapportFinancier(params).subscribe({
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
    // Graphique d'évolution mensuelle
    if (this.rapport.evolution_mensuelle && this.rapport.evolution_mensuelle.length > 0) {
      this.chartEvolution = {
        labels: this.rapport.evolution_mensuelle.map((e: any) => {
          const [year, month] = e.mois.split('-');
          return new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        }),
        datasets: [{
          label: 'Chiffre d\'Affaires',
          data: this.rapport.evolution_mensuelle.map((e: any) => e.chiffre_affaires),
          borderColor: '#2E86DE',
          backgroundColor: 'rgba(46, 134, 222, 0.1)',
          tension: 0.4,
          fill: true
        }]
      };
    }

    // Graphique de répartition
    this.chartRepartition = {
      labels: ['Chiffre d\'Affaires', 'Coût d\'Achat', 'Charges d\'Exploitation'],
      datasets: [{
        data: [
          this.rapport.chiffre_affaires || 0,
          this.rapport.cout_achat || 0,
          this.rapport.charges_exploitation || 0
        ],
        backgroundColor: ['#5CB85C', '#FFA502', '#FF6348']
      }]
    };
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatCurrency(value: any): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0 FCFA';
    return numValue.toLocaleString('fr-FR') + ' FCFA';
  }

  getTauxMarge(): number {
    if (!this.rapport || !this.rapport.chiffre_affaires || this.rapport.chiffre_affaires === 0) {
      return 0;
    }
    return (this.rapport.marge_globale / this.rapport.chiffre_affaires) * 100;
  }

  getTauxBenefice(): number {
    if (!this.rapport || !this.rapport.chiffre_affaires || this.rapport.chiffre_affaires === 0) {
      return 0;
    }
    return (this.rapport.benefice_net / this.rapport.chiffre_affaires) * 100;
  }

  getChartOptions(): any {
    return {
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              return context.dataset.label + ': ' + this.formatCurrency(context.parsed.y || context.parsed);
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: any) => {
              return (value / 1000) + 'K';
            }
          }
        }
      }
    };
  }

  getDoughnutOptions(): any {
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
}
