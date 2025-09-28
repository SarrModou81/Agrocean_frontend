// src/app/features/dashboard/components/alerts-list/alerts-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { Alerte } from '../../../../core/models/alerte.model';

@Component({
  selector: 'app-alerts-list',
  templateUrl: './alerts-list.component.html',
  styleUrls: ['./alerts-list.component.scss']
})
export class AlertsListComponent implements OnInit {
  alerts: Alerte[] = [];
  loading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadRecentAlerts();
  }

  private loadRecentAlerts(): void {
    this.loading = true;
    
    this.apiService.get<Alerte[]>('alertes/non-lues/list').subscribe({
      next: (data) => {
        this.alerts = data.slice(0, 5); // Prendre seulement les 5 premières
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des alertes:', error);
        this.loading = false;
      }
    });
  }

  getAlertIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'Stock_faible': 'fas fa-exclamation-triangle',
      'Peremption_proche': 'fas fa-clock',
      'Rupture_stock': 'fas fa-times-circle',
      'Commande_urgente': 'fas fa-bolt'
    };
    return icons[type] || 'fas fa-bell';
  }

  getAlertColor(type: string): string {
    const colors: { [key: string]: string } = {
      'Stock_faible': 'warning',
      'Peremption_proche': 'info',
      'Rupture_stock': 'danger',
      'Commande_urgente': 'primary'
    };
    return colors[type] || 'secondary';
  }

  markAsRead(alertId: number): void {
    this.apiService.post(`alertes/${alertId}/marquer-lu`, {}).subscribe({
      next: () => {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
          alert.lu = true;
        }
      },
      error: (error) => {
        console.error('Erreur lors du marquage de l\'alerte:', error);
      }
    });
  }
}
