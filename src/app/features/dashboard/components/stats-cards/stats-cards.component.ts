// src/app/features/dashboard/components/stats-cards/stats-cards.component.ts
import { Component, Input } from '@angular/core';
import { DashboardStats } from '../../services/dashboard.service';

interface StatCard {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

@Component({
  selector: 'app-stats-cards',
  templateUrl: './stats-cards.component.html',
  styleUrls: ['./stats-cards.component.scss']
})
export class StatsCardsComponent {
  @Input() stats: DashboardStats | null = null;

  get statCards(): StatCard[] {
    if (!this.stats) return [];

    return [
      {
        title: 'Chiffre d\'affaires (mois)',
        value: this.formatCurrency(this.stats.chiffres.ca_mois),
        subtitle: 'Ce mois-ci',
        icon: 'fas fa-chart-line',
        color: 'stat-success'
      },
      {
        title: 'Commandes en attente',
        value: this.stats.commandes.en_attente,
        subtitle: 'À traiter',
        icon: 'fas fa-clock',
        color: 'stat-warning'
      },
      {
        title: 'Produits en stock',
        value: this.stats.produits.en_stock,
        subtitle: `${this.stats.produits.total} produits total`,
        icon: 'fas fa-boxes',
        color: 'stat-info'
      },
      {
        title: 'Alertes actives',
        value: this.stats.alertes.total,
        subtitle: 'Nécessitent attention',
        icon: 'fas fa-exclamation-triangle',
        color: this.stats.alertes.total > 0 ? 'stat-danger' : 'stat-success'
      }
    ];
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}
