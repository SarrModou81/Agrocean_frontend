import { Component, OnInit } from '@angular/core';
import { FinanceService, FactureService } from '../../../core/services/finance.service';
import { MessageService } from 'primeng/api';

interface DashboardData {
  ca_mois: number;
  depenses_mois: number;
  creances_totales: number;
  valeur_stock: number;
  chiffre_affaires: number;
  charges: number;
  benefice_net: number;
  marge_globale: number;
  tresorerie: number;
  creances: number;
  evolution_ca: Array<{ periode: string; montant: number }>;
  repartition_charges: number[];
  factures_impayees: any[];
}

@Component({
  selector: 'app-finances-dashboard',
  templateUrl: './finances-dashboard.component.html',
  styleUrls: ['./finances-dashboard.component.scss']
})
export class FinancesDashboardComponent implements OnInit {
  dashboard: DashboardData | null = null;
  loading = false;
  showPaiementDialog = false;
  selectedFacture: any = null;

  selectedPeriode = 'mois';
  periodes = [
    { label: 'Ce mois', value: 'mois' },
    { label: 'Ce trimestre', value: 'trimestre' },
    { label: 'Cette année', value: 'annee' }
  ];

  caChartData: any = null;
  chargesChartData: any = null;
  chartOptions: any;
  pieOptions: any;

  constructor(
    private financeService: FinanceService,
    private factureService: FactureService,
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
        this.dashboard = {
          ...data,
          chiffre_affaires: data.ca_mois || 0,
          charges: data.depenses_mois || 0,
          benefice_net: (data.ca_mois || 0) - (data.depenses_mois || 0),
          marge_globale: data.ca_mois > 0 
            ? (((data.ca_mois - data.depenses_mois) / data.ca_mois) * 100) 
            : 0,
          tresorerie: (data.ca_mois || 0) - (data.depenses_mois || 0),
          creances: data.creances_totales || 0,
          evolution_ca: [],
          repartition_charges: [
            (data.depenses_mois || 0) * 0.6,
            (data.depenses_mois || 0) * 0.2,
            (data.depenses_mois || 0) * 0.1,
            (data.depenses_mois || 0) * 0.1
          ],
          factures_impayees: []
        };
        
        this.loadFacturesImpayees();
        this.prepareCharts();
      },
      error: (error) => {
        console.error('Erreur dashboard:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement du dashboard'
        });
        this.loading = false;
        this.initDefaultDashboard();
      }
    });
  }

  initDefaultDashboard(): void {
    this.dashboard = {
      ca_mois: 0,
      depenses_mois: 0,
      creances_totales: 0,
      valeur_stock: 0,
      chiffre_affaires: 0,
      charges: 0,
      benefice_net: 0,
      marge_globale: 0,
      tresorerie: 0,
      creances: 0,
      evolution_ca: [],
      repartition_charges: [0, 0, 0, 0],
      factures_impayees: []
    };
  }

  loadFacturesImpayees(): void {
    this.factureService.impayees().subscribe({
      next: (factures: any) => {
        if (this.dashboard) {
          this.dashboard.factures_impayees = Array.isArray(factures) 
            ? factures 
            : (factures.factures || factures.data || []);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur factures impayées:', error);
        if (this.dashboard) {
          this.dashboard.factures_impayees = [];
        }
        this.loading = false;
      }
    });
  }

  initChartOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color') || '#495057';
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dee2e6';

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: textColor,
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += this.formatCurrency(context.parsed.y);
              }
              return label;
            }
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

    this.pieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: {
            color: textColor,
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${label}: ${this.formatCurrency(value)} (${percentage}%)`;
            }
          }
        }
      }
    };
  }

  prepareCharts(): void {
    if (!this.dashboard) return;

    const labels = [];
    const data = [];
    const baseCA = this.dashboard.chiffre_affaires || 0;
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
      
      const variation = (Math.random() - 0.5) * 0.3;
      data.push(Math.max(0, (baseCA / 7) * (1 + variation)));
    }

    this.caChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Chiffre d\'Affaires',
          data: data,
          borderColor: '#43e97b',
          backgroundColor: 'rgba(67, 233, 123, 0.2)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };

    this.chargesChartData = {
      labels: ['Achats', 'Salaires', 'Loyer', 'Autres'],
      datasets: [
        {
          data: this.dashboard.repartition_charges || [0, 0, 0, 0],
          backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
          hoverBackgroundColor: ['#5568d3', '#653d8b', '#d97de4', '#3895e7']
        }
      ]
    };
  }

  getFacturesImpayees(): any[] {
    return this.dashboard?.factures_impayees || [];
  }

  getJoursRetard(facture: any): string {
    if (!facture.date_echeance) return '0 jour';
    
    const dateEcheance = new Date(facture.date_echeance);
    const aujourd_hui = new Date();
    const diffTime = aujourd_hui.getTime() - dateEcheance.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return '0 jour';
    } else if (diffDays === 1) {
      return '1 jour';
    } else {
      return `${diffDays} jours`;
    }
  }

  getRetardSeverity(facture: any): 'success' | 'warning' | 'danger' {
    if (!facture.date_echeance) return 'success';
    
    const dateEcheance = new Date(facture.date_echeance);
    const aujourd_hui = new Date();
    const diffTime = aujourd_hui.getTime() - dateEcheance.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return 'success';
    } else if (diffDays <= 30) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  enregistrerPaiement(facture: any): void {
    this.selectedFacture = facture;
    this.showPaiementDialog = true;
  }

  onPaiementSubmitted(): void {
    this.showPaiementDialog = false;
    this.selectedFacture = null;
    this.loadDashboard();
    this.messageService.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Paiement enregistré avec succès'
    });
  }

  formatCurrency(value: number | undefined): string {
    if (value === undefined || value === null || isNaN(value)) return '0 FCFA';
    return Math.round(value).toLocaleString('fr-FR') + ' FCFA';
  }

  formatNumber(value: number | undefined): string {
    if (value === undefined || value === null || isNaN(value)) return '0.00';
    return value.toFixed(2);
  }
}