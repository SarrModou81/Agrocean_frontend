import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../core/services/auth.service';
import { RapportService } from '../../core/services/all-services';
import { DashboardStats } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  stats: DashboardStats | null = null;
  loading = true;

  // Données pour les graphiques
  ventesChartData: any;
  ventesChartOptions: any;

  topProduitsChartData: any;
  topProduitsChartOptions: any;

  // Rendre authService public pour l'utiliser dans le template
  constructor(
    public authService: AuthService,
    private rapportService: RapportService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.rapportService.dashboard().subscribe({
      next: (data) => {
        this.stats = data;
        this.prepareCharts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du dashboard', error);
        this.loading = false;
      }
    });
  }

  prepareCharts(): void {
    if (!this.stats) return;

    // Graphique d'évolution des ventes
    const labels = this.stats.evolution_ventes?.map((v: any) => {
      const date = new Date(v.date);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    }) || [];
    const data = this.stats.evolution_ventes?.map((v: any) => v.montant) || [];

    this.ventesChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Ventes (FCFA)',
          data: data,
          fill: true,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.2)',
          tension: 0.4
        }
      ]
    };

    this.ventesChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              return context.dataset.label + ': ' + 
                     context.parsed.y.toLocaleString('fr-FR') + ' FCFA';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value: any) {
              return (value / 1000).toFixed(0) + 'k';
            }
          }
        }
      }
    };

    // Graphique des top produits
    const produitsLabels = this.stats.top_produits?.map((p: any) => p.produit?.nom || 'Produit') || [];
    const produitsQuantites = this.stats.top_produits?.map((p: any) => p.total_quantite) || [];

    this.topProduitsChartData = {
      labels: produitsLabels,
      datasets: [
        {
          label: 'Quantité vendue',
          data: produitsQuantites,
          backgroundColor: [
            '#667eea',
            '#764ba2',
            '#f093fb',
            '#4facfe',
            '#43e97b'
          ]
        }
      ]
    };

    this.topProduitsChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      }
    };
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }

  getSeverity(type: string): string {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'danger':
        return 'danger';
      default:
        return 'info';
    }
  }

  getRoleDisplay(): string {
    if (!this.currentUser) return '';
    
    const roleMap: { [key: string]: string } = {
      'Administrateur': 'Administrateur',
      'Commercial': 'Commercial',
      'GestionnaireStock': 'Gestionnaire de Stock',
      'Comptable': 'Comptable',
      'AgentApprovisionnement': 'Agent d\'Approvisionnement'
    };

    return roleMap[this.currentUser.role] || this.currentUser.role;
  }
}