import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LivraisonService, VenteService } from '../../../core/services/all-services';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-livraisons-list',
  templateUrl: './livraisons-list.component.html',
  styleUrls: ['./livraisons-list.component.scss']
})
export class LivraisonsListComponent implements OnInit {
  livraisons: any[] = [];
  loading = false;
  displayDialog = false;
  selectedLivraison: any = null;
  ventes: any[] = [];
  statuts = [
    {label: 'Toutes', value: ''},
    {label: 'Planifiée', value: 'Planifiée'},
    {label: 'En Cours', value: 'EnCours'},
    {label: 'Livrée', value: 'Livrée'},
    {label: 'Annulée', value: 'Annulée'}
  ];
  selectedStatut = '';

  constructor(
    private livraisonService: LivraisonService,
    private venteService: VenteService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLivraisons();
    this.loadVentes();
  }

  loadLivraisons(): void {
    this.loading = true;
    const params: any = {};
    if (this.selectedStatut) {
      params.statut = this.selectedStatut;
    }

    this.livraisonService.getAll(params).subscribe({
      next: (response: any) => {
        this.livraisons = Array.isArray(response) ? response : (response.data || []);
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des livraisons'
        });
        this.loading = false;
      }
    });
  }

  loadVentes(): void {
    this.venteService.getAll({statut: 'Validée'}).subscribe({
      next: (response: any) => {
        this.ventes = Array.isArray(response) ? response : (response.data || []);
      }
    });
  }

  openNew(): void {
    this.selectedLivraison = {
      vente_id: null,
      date_prevue: new Date(),
      adresse: '',
      livreur: ''
    };
    this.displayDialog = true;
  }

  editLivraison(livraison: any): void {
    this.selectedLivraison = {
      ...livraison,
      date_prevue: new Date(livraison.date_prevue)
    };
    this.displayDialog = true;
  }

  saveLivraison(): void {
    if (this.selectedLivraison.id) {
      this.livraisonService.update(this.selectedLivraison.id, this.selectedLivraison).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Livraison mise à jour avec succès'
          });
          this.displayDialog = false;
          this.loadLivraisons();
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
      this.livraisonService.create(this.selectedLivraison).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Livraison créée avec succès'
          });
          this.displayDialog = false;
          this.loadLivraisons();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error.error?.error || 'Erreur lors de la création'
          });
        }
      });
    }
  }

  demarrerLivraison(livraison: any): void {
    this.confirmationService.confirm({
      message: 'Voulez-vous démarrer cette livraison ?',
      header: 'Confirmation',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.livraisonService.demarrer(livraison.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Livraison démarrée'
            });
            this.loadLivraisons();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: error.error?.error || 'Erreur'
            });
          }
        });
      }
    });
  }

  confirmerLivraison(livraison: any): void {
    this.confirmationService.confirm({
      message: 'Confirmer la livraison ?',
      header: 'Confirmation',
      icon: 'pi pi-check-circle',
      accept: () => {
        this.livraisonService.confirmer(livraison.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Livraison confirmée'
            });
            this.loadLivraisons();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: error.error?.error || 'Erreur'
            });
          }
        });
      }
    });
  }

  annulerLivraison(livraison: any): void {
    this.confirmationService.confirm({
      message: 'Annuler cette livraison ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.livraisonService.annuler(livraison.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'warning',
              summary: 'Succès',
              detail: 'Livraison annulée'
            });
            this.loadLivraisons();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: error.error?.error || 'Erreur'
            });
          }
        });
      }
    });
  }

  getStatutSeverity(statut: string): 'success' | 'info' | 'warning' | 'danger' {
    const severityMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
      'Planifiée': 'info',
      'EnCours': 'warning',
      'Livrée': 'success',
      'Annulée': 'danger'
    };
    return severityMap[statut] || 'info';
  }
}
