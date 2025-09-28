// src/app/features/dashboard/components/top-products/top-products.component.ts
import { Component, OnInit } from '@angular/core';
import { DashboardService, TopProduit } from '../../services/dashboard.service';

@Component({
  selector: 'app-top-products',
  templateUrl: './top-products.component.html',
  styleUrls: ['./top-products.component.scss']
})
export class TopProductsComponent implements OnInit {
  topProducts: TopProduit[] = [];
  loading = true;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadTopProducts();
  }

  private loadTopProducts(): void {
    this.loading = true;
    
    this.dashboardService.getTopProduits(5).subscribe({
      next: (data) => {
        this.topProducts = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des top produits:', error);
        this.loading = false;
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  }
}