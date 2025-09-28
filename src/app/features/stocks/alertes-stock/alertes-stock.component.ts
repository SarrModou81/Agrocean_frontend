// src/app/features/stocks/alertes-stock/alertes-stock.component.ts
import { Component, OnInit } from '@angular/core';
import { StocksService } from '../services/stocks.service';
import { Stock } from '../../../core/models/stock.model';

@Component({
  selector: 'app-alertes-stock',
  templateUrl: './alertes-stock.component.html',
  styleUrls: ['./alertes-stock.component.scss']
})
export class AlertesStockComponent implements OnInit {
  alertes: Stock[] = [];
  loading = true;

  constructor(private stocksService: StocksService) {}

  ngOnInit(): void {
    this.loadAlertes();
  }

  private loadAlertes(): void {
    this.loading = true;
    
    this.stocksService.getAlertes().subscribe({
      next: (data) => {
        this.alertes = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des alertes:', error);
        this.loading = false;
      }
    });
  }

  getAlertLevel(stock: Stock): 'critical' | 'warning' | 'info' {
    if (stock.quantite_disponible <= 0) return 'critical';
    if (stock.quantite_disponible <= stock.seuil_alerte * 0.5) return 'critical';
    if (stock.quantite_disponible <= stock.seuil_alerte) return 'warning';
    return 'info';
  }

  getAlertIcon(level: string): string {
    const icons: { [key: string]: string } = {
      'critical': 'error',
      'warning': 'warning',
      'info': 'info'
    };
    return icons[level] || 'info';
  }

  getAlertColor(level: string): string {
    const colors: { [key: string]: string } = {
      'critical': 'danger',
      'warning': 'warning',
      'info': 'info'
    };
    return colors[level] || 'info';
  }

  calculateDaysRemaining(stock: Stock): number {
    // Calcul approximatif basé sur la consommation moyenne
    return Math.floor(stock.quantite_disponible / Math.max(1, stock.seuil_alerte * 0.1));
  }
}