// src/app/features/produits/produits-list/produits-list.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ProduitsService, ProduitFilters } from '../services/produits.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Produit } from '../../../core/models/produit.model';
import { ProduitFormComponent } from '../produit-form/produit-form.component';
import { ProduitDeleteDialogComponent } from '../produit-delete-dialog/produit-delete-dialog.component';

@Component({
  selector: 'app-produits-list',
  templateUrl: './produits-list.component.html',
  styleUrls: ['./produits-list.component.scss']
})
export class ProduitsListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<Produit>();
  displayedColumns: string[] = [
    'code_produit',
    'nom',
    'categorie',
    'unite_mesure',
    'prix_unitaire',
    'duree_conservation',
    'is_active',
    'actions'
  ];

  loading = true;
  totalItems = 0;
  pageSize = 15;
  currentPage = 0;

  // Filtres
  searchControl = new FormControl('');
  categorieControl = new FormControl('');
  statusControl = new FormControl('');

  categories = [
    { value: 'Fruit', label: 'Fruits' },
    { value: 'Legume', label: 'Légumes' },
    { value: 'Poisson', label: 'Poissons' },
    { value: 'Crustace', label: 'Crustacés' },
    { value: 'Halieutique', label: 'Halieutiques' }
  ];

  constructor(
    private produitsService: ProduitsService,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProduits();
    this.setupFilters();
  }

  private setupFilters(): void {
    // Recherche avec debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadProduits();
    });

    // Filtres de catégorie et statut
    this.categorieControl.valueChanges.subscribe(() => {
      this.currentPage = 0;
      this.loadProduits();
    });

    this.statusControl.valueChanges.subscribe(() => {
      this.currentPage = 0;
      this.loadProduits();
    });
  }

  private getFilters(): ProduitFilters {
    const filters: ProduitFilters = {};
    
    if (this.searchControl.value?.trim()) {
      filters.search = this.searchControl.value.trim();
    }
    
    if (this.categorieControl.value) {
      filters.categorie = this.categorieControl.value;
    }
    
    if (this.statusControl.value !== '') {
      filters.is_active = this.statusControl.value === 'true';
    }
    
    return filters;
  }

  loadProduits(): void {
    this.loading = true;
    const filters = this.getFilters();

    this.produitsService.getProduits(this.currentPage + 1, this.pageSize, filters).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.totalItems = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits:', error);
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProduits();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProduitFormComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProduits();
        this.notificationService.success('Produit créé avec succès');
      }
    });
  }

  openEditDialog(produit: Produit): void {
    const dialogRef = this.dialog.open(ProduitFormComponent, {
      width: '600px',
      data: { mode: 'edit', produit }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProduits();
        this.notificationService.success('Produit modifié avec succès');
      }
    });
  }

  openDeleteDialog(produit: Produit): void {
    const dialogRef = this.dialog.open(ProduitDeleteDialogComponent, {
      width: '400px',
      data: produit
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProduits();
        this.notificationService.success('Produit supprimé avec succès');
      }
    });
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.categorieControl.setValue('');
    this.statusControl.setValue('');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getCategoryLabel(category: string): string {
    const cat = this.categories.find(c => c.value === category);
    return cat ? cat.label : category;
  }

  getUniteLabel(unite: string): string {
    const unites: { [key: string]: string } = {
      'kg': 'Kilogramme',
      'paquet': 'Paquet',
      'piece': 'Pièce'
    };
    return unites[unite] || unite;
  }
}