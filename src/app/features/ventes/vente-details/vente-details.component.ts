// src/app/features/ventes/vente-details/vente-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VenteService } from '../../../core/services/all-services';
import { Vente } from '../../../core/models';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-vente-details',
  templateUrl: './vente-details.component.html',
  styleUrls: ['./vente-details.component.scss']
})
export class VenteDetailsComponent implements OnInit {
  vente: Vente | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private venteService: VenteService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadVente(id);
  }

  loadVente(id: number): void {
    this.loading = true;
    this.venteService.getById(id).subscribe({
      next: (data) => {
        this.vente = data;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.error?.message || 'Erreur lors du chargement de la vente'
        });
        this.loading = false;
        this.router.navigate(['/ventes']);
      }
    });
  }

  valider(): void {
    if (!this.vente) return;

    // Vérifier que la confirmation n'est pas déjà ouverte
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir valider la vente ${this.vente.numero} ?`,
      header: 'Confirmation de validation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, valider',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.loading = true;
        this.venteService.valider(this.vente!.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Vente validée avec succès'
            });
            this.loading = false;
            this.loadVente(this.vente!.id!);
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: error.error?.message || 'Erreur lors de la validation'
            });
            this.loading = false;
          }
        });
      },
      reject: () => {
        // L'utilisateur a annulé
      }
    });
  }

  annuler(): void {
    if (!this.vente) return;

    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir annuler la vente ${this.vente.numero} ?`,
      header: 'Confirmation d\'annulation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, annuler',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.loading = true;
        this.venteService.annuler(this.vente!.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Vente annulée avec succès'
            });
            this.loading = false;
            this.loadVente(this.vente!.id!);
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: error.error?.message || 'Erreur lors de l\'annulation'
            });
            this.loading = false;
          }
        });
      },
      reject: () => {
        // L'utilisateur a refusé l'annulation
      }
    });
  }

  retour(): void {
    this.router.navigate(['/ventes']);
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }

  getStatutSeverity(statut: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' {
    const severityMap: Record<string, 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast'> = {
      'Brouillon': 'info',
      'Validée': 'warning',
      'Livrée': 'success',
      'Annulée': 'danger'
    };
    return severityMap[statut] || 'info';
  }
}