// src/app/features/stocks/stocks-list/stocks-list.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { StocksService, StockFilters } from '../services/stocks.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Stock } from '../../../core/models/stock.model';
import { StockAjustementDialogComponent } from '../stock-ajustement-dialog/stock-ajustement-dialog.component';

@Component({
  selector: 'app-stocks-list',
  templateUrl: './stocks-list.component.html',
  styleUrls: ['./stocks-list.component.scss']
})
export class StocksListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<Stock>();
  displayedColumns: string[] = [
    'produit',
    'quantite_disponible',
    'quantite_reservee',
    'seuil_alerte',
    'emplacement',
    'statut',
    'actions'
  ];

  loading = true;
  totalItems = 0;
  pageSize = 15;
  currentPage = 0;

  // Filtres
  searchControl = new FormControl('');
  alerteControl = new FormControl('');
  seuilControl = new FormControl('');

  constructor(
    private stocksService: StocksService,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadStocks();
    this.setupFilters();
  }

  private setupFilters(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadStocks();
    });

    this.alerteControl.valueChanges.subscribe(() => {
      this.currentPage = 0;
      this.loadStocks();
    });

    this.seuilControl.valueChanges.subscribe(() => {
      this.currentPage = 0;
      this.loadStocks();
    });
  }

  private getFilters(): StockFilters {
    const filters: StockFilters = {};
    
    if (this.searchControl.value?.trim()) {
      filters.search = this.searchControl.value.trim();
    }
    
    if (this.alerteControl.value !== '') {
      filters.alerte_active = this.alerteControl.value === 'true';
    }
    
    if (this.seuilControl.value === 'true') {
      filters.seuil_atteint = true;
    }
    
    return filters;
  }

  loadStocks(): void {
    this.loading = true;
    const filters = this.getFilters();

    this.stocksService.getStocks(this.currentPage + 1, this.pageSize, filters).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.totalItems = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des stocks:', error);
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadStocks();
  }

  openAjustementDialog(stock: Stock): void {
    const dialogRef = this.dialog.open(StockAjustementDialogComponent, {
      width: '500px',
      data: stock
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadStocks();
        this.notificationService.success('Stock ajusté avec succès');
      }
    });
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.alerteControl.setValue('');
    this.seuilControl.setValue('');
  }

  getStockStatus(stock: Stock): { label: string; color: string; icon: string } {
    if (stock.quantite_disponible <= 0) {
      return { label: 'Rupture', color: 'danger', icon: 'error' };
    } else if (stock.quantite_disponible <= stock.seuil_alerte) {
      return { label: 'Stock faible', color: 'warning', icon: 'warning' };
    } else {
      return { label: 'Disponible', color: 'success', icon: 'check_circle' };
    }
  }

  calculateStockValue(stock: Stock): number {
    return stock.quantite_disponible * (stock.produit?.prix_unitaire || 0);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  }
}

