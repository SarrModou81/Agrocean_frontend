import { Component, OnInit } from '@angular/core';
import { FournisseurService } from '../../../core/services/all-services';
import { Fournisseur } from '../../../core/models';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-fournisseurs-list',
  templateUrl: './fournisseurs-list.component.html',
  styleUrls: ['./fournisseurs-list.component.scss']
})
export class FournisseursListComponent implements OnInit {
  fournisseurs: Fournisseur[] = [];
  loading = false;
  displayDialog = false;
  selectedFournisseur: Fournisseur | null = null;
  isEditing = false;

  totalRecords = 0;
  currentPage = 1;
  pageSize = 20;

  constructor(
    private fournisseurService: FournisseurService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadFournisseurs();
  }

  loadFournisseurs(): void {
    this.loading = true;
    this.fournisseurService.getAll({ page: this.currentPage, per_page: this.pageSize }).subscribe({
      next: (response) => {
        this.fournisseurs = response.data;
        this.totalRecords = response.total;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des fournisseurs'
        });
        this.loading = false;
      }
    });
  }

  openNew(): void {
    this.selectedFournisseur = null;
    this.isEditing = false;
    this.displayDialog = true;
  }

  editFournisseur(fournisseur: Fournisseur): void {
    this.selectedFournisseur = { ...fournisseur };
    this.isEditing = true;
    this.displayDialog = true;
  }

  deleteFournisseur(fournisseur: Fournisseur): void {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer ${fournisseur.nom} ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.fournisseurService.delete(fournisseur.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Fournisseur supprimé avec succès'
            });
            this.loadFournisseurs();
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
    this.loadFournisseurs();
    this.displayDialog = false;
  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.loadFournisseurs();
  }

  getEvaluationClass(evaluation: number): string {
    if (evaluation >= 4) return 'eval-excellent';
    if (evaluation >= 3) return 'eval-good';
    if (evaluation >= 2) return 'eval-average';
    return 'eval-poor';
  }
}