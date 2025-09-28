// src/app/features/dashboard/components/recent-orders/recent-orders.component.ts
import { Component, OnInit } from '@angular/core';
import { Commande } from '../../../core/models/commande.model';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-recent-orders',
  templateUrl: './recent-orders.component.html',
  styleUrls: ['./recent-orders.component.scss']
})
export class RecentOrdersComponent implements OnInit {
  recentOrders: Commande[] = [];
  loading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadRecentOrders();
  }

  private loadRecentOrders(): void {
    this.loading = true;
    
    this.apiService.getPaginated<Commande>('commandes', 1, 5).subscribe({
      next: (response) => {
        this.recentOrders = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes:', error);
        this.loading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'En_attente': 'warning',
      'Confirmee': 'info',
      'En_preparation': 'primary',
      'Livree': 'success',
      'Annulee': 'danger'
    };
    return colors[status] || 'secondary';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'En_attente': 'En attente',
      'Confirmee': 'Confirmée',
      'En_preparation': 'En préparation',
      'Livree': 'Livrée',
      'Annulee': 'Annulée'
    };
    return labels[status] || status;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  }
}