import { Component, OnInit } from '@angular/core';
import { CategorieService } from '../../../core/services/all-services';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.scss']
})
export class CategoriesListComponent implements OnInit {
  categories: any[] = [];
  loading = false;
  displayDialog = false;
  selectedCategorie: any = null;

  constructor(
    private categorieService: CategorieService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categorieService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des catégories'
        });
        this.loading = false;
      }
    });
  }

  openNew(): void {
    this.selectedCategorie = {
      nom: '',
      description: '',
      type_stockage: 'AmbiantSec'
    };
    this.displayDialog = true;
  }

  editCategorie(categorie: any): void {
    this.selectedCategorie = { ...categorie };
    this.displayDialog = true;
  }

  saveCategorie(): void {
    if (this.selectedCategorie.id) {
      this.categorieService.update(this.selectedCategorie.id, this.selectedCategorie).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Catégorie mise à jour avec succès'
          });
          this.displayDialog = false;
          this.loadCategories();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors de la mise à jour'
          });
        }
      });
    } else {
      this.categorieService.create(this.selectedCategorie).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Catégorie créée avec succès'
          });
          this.displayDialog = false;
          this.loadCategories();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors de la création'
          });
        }
      });
    }
  }

  deleteCategorie(categorie: any): void {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer la catégorie "${categorie.nom}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.categorieService.delete(categorie.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Catégorie supprimée avec succès'
            });
            this.loadCategories();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: error.error?.error || 'Erreur lors de la suppression'
            });
          }
        });
      }
    });
  }

  getTypeStockageSeverity(type: string): 'success' | 'info' | 'warning' | 'danger' {
    const severityMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
      'Frais': 'info',
      'Congelé': 'primary' as any,
      'AmbiantSec': 'success',
      'AmbiantHumide': 'warning'
    };
    return severityMap[type] || 'info';
  }
}
