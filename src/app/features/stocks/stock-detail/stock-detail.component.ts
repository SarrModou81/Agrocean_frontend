// src/app/features/stocks/stock-detail/stock-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { StocksService } from '../services/stocks.service';
import { Stock } from '../../../core/models/stock.model';
import { MouvementStock } from '../../../core/models/mouvement-stock.model';
import { StockAjustementDialogComponent } from '../stock-ajustement-dialog/stock-ajustement-dialog.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-stock-detail',
  templateUrl: './stock-detail.component.html',
  styleUrls: ['./stock-detail.component.scss']
})
export class StockDetailComponent implements OnInit {
  stock: Stock | null = null;
  mouvements: MouvementStock[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stocksService: StocksService,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadStock(id);
      this.loadRecentMovements(id);
    } else {
      this.router.navigate(['/stocks']);
    }
  }

  private loadStock(id: number): void {
    this.stocksService.getStock(id).subscribe({
      next: (stock) => {
        this.stock = stock;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du stock:', error);
        this.notificationService.error('Stock non trouvé');
        this.router.navigate(['/stocks']);
      }
    });
  }

  private loadRecentMovements(stockId: number): void {
    // Charger les 10 derniers mouvements pour ce produit
    this.stocksService.getMouvements(1, 10, { produit_id: this.stock?.produit_id }).subscribe({
      next: (response) => {
        this.mouvements = response.data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des mouvements:', error);
      }
    });
  }

  openAjustementDialog(): void {
    if (!this.stock) return;

    const dialogRef = this.dialog.open(StockAjustementDialogComponent, {
      width: '500px',
      data: this.stock
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadStock(this.stock!.id);
        this.loadRecentMovements(this.stock!.id);
        this.notificationService.success('Stock ajusté avec succès');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/stocks']);
  }

  calculateStockValue(): number {
    if (!this.stock || !this.stock.produit) return 0;
    return this.stock.quantite_disponible * this.stock.produit.prix_unitaire;
  }

  getStockStatus(): { label: string; color: string; icon: string } {
    if (!this.stock) return { label: '', color: '', icon: '' };

    if (this.stock.quantite_disponible <= 0) {
      return { label: 'Rupture', color: 'danger', icon: 'error' };
    } else if (this.stock.quantite_disponible <= this.stock.seuil_alerte) {
      return { label: 'Stock faible', color: 'warning', icon: 'warning' };
    } else {
      return { label: 'Disponible', color: 'success', icon: 'check_circle' };
    }
  }

  getMouvementIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'Entree': 'add',
      'Sortie': 'remove',
      'Transfert': 'swap_horiz',
      'Ajustement': 'tune',
      'Perte': 'clear'
    };
    return icons[type] || 'help';
  }

  getMouvementColor(type: string): string {
    const colors: { [key: string]: string } = {
      'Entree': 'success',
      'Sortie': 'danger',
      'Transfert': 'info',
      'Ajustement': 'warning',
      'Perte': 'danger'
    };
    return colors[type] || 'secondary';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getCategoryLabel(category: string): string {
    const categories: { [key: string]: string } = {
      'Fruit': 'Fruits',
      'Legume': 'Légumes',
      'Poisson': 'Poissons',
      'Crustace': 'Crustacés',
      'Halieutique': 'Halieutiques'
    };
    return categories[category] || category;
  }

  calculateRotation(): number {
    // Estimation simple basée sur le stock actuel et le seuil d'alerte
    if (!this.stock || this.stock.seuil_alerte === 0) return 0;
    return Math.round(this.stock.quantite_disponible / (this.stock.seuil_alerte * 0.1));
  }

  calculateAlertPercentage(): number {
    if (!this.stock || this.stock.seuil_alerte === 0) return 0;
    return Math.round((this.stock.quantite_disponible / this.stock.seuil_alerte) * 100);
  }
}