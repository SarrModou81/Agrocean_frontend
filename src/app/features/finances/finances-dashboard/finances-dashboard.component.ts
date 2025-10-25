import { Component, OnInit } from '@angular/core';
import { FinanceService } from '../../../core/services/all-services';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-finances-dashboard',
  templateUrl: './finances-dashboard.component.html',
  styleUrls: ['./finances-dashboard.component.scss']
})
export class FinancesDashboardComponent implements OnInit {
  dashboard: any = null;
  loading = false;
  showPaiementDialog = false;
  selectedFacture: any = null;

  selectedPeriode = 'mois';
  periodes = [
    { label: 'Ce mois', value: 'mois' },
    { label: 'Ce trimestre', value: 'trimestre' },
    { label: 'Cette année', value: 'annee' }
  ];

  caChartData: any;
  chargesChartData: any;
  chartOptions: any;
  pieOptions: any;

  constructor(
    private financeService: FinanceService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initChartOptions();
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.financeService.dashboardFinancier().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.prepareCharts();
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement du dashboard'
        });
        this.loading = false;
      }
    });
  }

  initChartOptions(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value: any) {
              return (value / 1000).toFixed(0) + 'k FCFA';
            }
          }
        }
      }
    };

    this.pieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'right'
        }
      }
    };
  }

  prepareCharts(): void {
    if (!this.dashboard) return;

    // Chart CA
    this.caChartData = {
      labels: this.dashboard.evolution_ca?.map((item: any) => item.periode) || [],
      datasets: [
        {
          label: 'Chiffre d\'Affaires',
          data: this.dashboard.evolution_ca?.map((item: any) => item.montant) || [],
          borderColor: '#43e97b',
          backgroundColor: 'rgba(67, 233, 123, 0.2)',
          tension: 0.4
        }
      ]
    };

    // Chart Charges
    this.chargesChartData = {
      labels: ['Achats', 'Salaires', 'Loyer', 'Autres'],
      datasets: [
        {
          data: this.dashboard.repartition_charges || [0, 0, 0, 0],
          backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe']
        }
      ]
    };
  }

  enregistrerPaiement(facture: any): void {
    this.selectedFacture = facture;
    this.showPaiementDialog = true;
  }

  onPaiementSubmitted(): void {
    this.showPaiementDialog = false;
    this.loadDashboard();
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }
}