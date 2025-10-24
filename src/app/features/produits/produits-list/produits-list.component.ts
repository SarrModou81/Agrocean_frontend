// src/app/features/produits/produits-list/produits-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CategorieService } from '../../../core/services/all-services';
import { Produit, Categorie } from '../../../core/models';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProduitService } from '../../../core/services/produit.service';

@Component({
  selector: 'app-produits-list',
  templateUrl: './produits-list.component.html',
  styleUrls: ['./produits-list.component.scss']
})
export class ProduitsListComponent implements OnInit {
  produits: Produit[] = [];
  categories: Categorie[] = [];
  loading = false;
  displayDialog = false;
  selectedProduit: Produit | null = null;
  isEditing = false;

  totalRecords = 0;
  currentPage = 1;
  pageSize = 20;

  selectedCategorie: number | null = null;
  searchTerm: string = '';

  constructor(
    private produitService: ProduitService,
    private categorieService: CategorieService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProduits();
  }

  loadCategories(): void {
    this.categorieService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
      }
    });
  }

  loadProduits(): void {
    this.loading = true;
    const params: any = {
      page: this.currentPage,
      per_page: this.pageSize
    };

    if (this.selectedCategorie) {
      params.categorie_id = this.selectedCategorie;
    }

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    this.produitService.getAll(params).subscribe({
      next: (response) => {
        this.produits = response.data;
        this.totalRecords = response.total;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des produits'
        });
        this.loading = false;
      }
    });
  }

  openNew(): void {
    this.selectedProduit = null;
    this.isEditing = false;
    this.displayDialog = true;
  }

  editProduit(produit: Produit): void {
    this.selectedProduit = { ...produit };
    this.isEditing = true;
    this.displayDialog = true;
  }

  deleteProduit(produit: Produit): void {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer ${produit.nom} ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.produitService.delete(produit.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Produit supprimé avec succès'
            });
            this.loadProduits();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la suppression'
            });
          }
        });
      }
    });
  }

  onDialogHide(): void {
    this.loadProduits();
    this.displayDialog = false;
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadProduits();
  }

  clearFilters(): void {
    this.selectedCategorie = null;
    this.searchTerm = '';
    this.applyFilters();
  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.loadProduits();
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }
}