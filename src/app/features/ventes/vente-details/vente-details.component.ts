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
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement de la vente'
        });
        this.loading = false;
        this.router.navigate(['/ventes']);
      }
    });
  }

  valider(): void {
    if (!this.vente) return;

    this.confirmationService.confirm({
      message: `Valider la vente ${this.vente.numero} ?`,
      header: 'Confirmation',
      icon: 'pi pi-check',
      accept: () => {
        this.venteService.valider(this.vente!.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Vente validée avec succès'
            });
            this.loadVente(this.vente!.id!);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la validation'
            });
          }
        });
      }
    });
  }

  annuler(): void {
    if (!this.vente) return;

    this.confirmationService.confirm({
      message: `Annuler la vente ${this.vente.numero} ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.venteService.annuler(this.vente!.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Vente annulée avec succès'
            });
            this.loadVente(this.vente!.id!);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de l\'annulation'
            });
          }
        });
      }
    });
  }

  retour(): void {
    this.router.navigate(['/ventes']);
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }

  getStatutSeverity(statut: string): string {
    const map: any = {
      'Brouillon': 'info',
      'Validée': 'warning',
      'Livrée': 'success',
      'Annulée': 'danger'
    };
    return map[statut] || 'info';
  }
}