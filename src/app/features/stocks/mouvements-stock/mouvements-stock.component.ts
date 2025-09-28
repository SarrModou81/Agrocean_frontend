// src/app/features/stocks/mouvements-stock/mouvements-stock.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { StocksService, MouvementFilters } from '../services/stocks.service';
import { MouvementStock } from '../../../core/models/mouvement-stock.model';

@Component({
  selector: 'app-mouvements-stock',
  templateUrl: './mouvements-stock.component.html',
  styleUrls: ['./mouvements-stock.component.scss']
})
export class MouvementsStockComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<MouvementStock>();
  displayedColumns: string[] = [
    'date_mouvement',
    'produit',
    'type_mouvement',
    'quantite',
    'motif',
    'user'
  ];

  loading = true;
  totalItems = 0;
  pageSize = 15;
  currentPage = 0;

  // Filtres
  typeControl = new FormControl('');
  dateDebutControl = new FormControl('');
  dateFinControl = new FormControl('');

  typesMouvement = [
    { value: 'Entree', label: 'Entrée', icon: 'add', color: 'success' },
    { value: 'Sortie', label: 'Sortie', icon: 'remove', color: 'danger' },
    { value: 'Transfert', label: 'Transfert', icon: 'swap_horiz', color: 'info' },
    { value: 'Ajustement', label: 'Ajustement', icon: 'tune', color: 'warning' },
    { value: 'Perte', label: 'Perte', icon: 'clear', color: 'danger' }
  ];

  constructor(private stocksService: StocksService) {}

  ngOnInit(): void {
    this.loadMouvements();
    this.setupFilters();
  }

  private setupFilters(): void {
    this.typeControl.valueChanges.subscribe(() => {
      this.currentPage = 0;
      this.loadMouvements();
    });

    this.dateDebutControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadMouvements();
    });

    this.dateFinControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadMouvements();
    });
  }

  private getFilters(): MouvementFilters {
    const filters: MouvementFilters = {};
    
    if (this.typeControl.value) {
      filters.type_mouvement = this.typeControl.value;
    }
    
    if (this.dateDebutControl.value) {
      filters.date_debut = this.dateDebutControl.value;
    }
    
    if (this.dateFinControl.value) {
      filters.date_fin = this.dateFinControl.value;
    }
    
    return filters;
  }

  loadMouvements(): void {
    this.loading = true;
    const filters = this.getFilters();

    this.stocksService.getMouvements(this.currentPage + 1, this.pageSize, filters).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.totalItems = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des mouvements:', error);
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadMouvements();
  }

  clearFilters(): void {
    this.typeControl.setValue('');
    this.dateDebutControl.setValue('');
    this.dateFinControl.setValue('');
  }

  getMouvementInfo(type: string): any {
    return this.typesMouvement.find(t => t.value === type) || 
           { label: type, icon: 'help', color: 'secondary' };
  }
}
