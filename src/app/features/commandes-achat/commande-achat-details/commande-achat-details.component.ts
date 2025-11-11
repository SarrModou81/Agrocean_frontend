import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommandeAchatService, EntrepotService } from '../../../core/services/all-services';
import { CommandeAchat, Entrepot } from '../../../core/models';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-commande-achat-details',
  templateUrl: './commande-achat-details.component.html',
  styleUrls: ['./commande-achat-details.component.scss']
})
export class CommandeAchatDetailsComponent implements OnInit {
  commande: CommandeAchat | null = null;
  loading = false;
  showReceptionDialog = false;
  entrepots: Entrepot[] = [];
  selectedEntrepot: number | null = null;
  produitsReception: any[] = [];
  minDate = new Date();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commandeService: CommandeAchatService,
    private entrepotService: EntrepotService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadCommande(id);
    this.loadEntrepots();
  }

  loadCommande(id: number): void {
    this.loading = true;
    this.commandeService.getById(id).subscribe({
      next: (data) => {
        this.commande = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement de la commande'
        });
        this.loading = false;
        this.router.navigate(['/commandes-achat']);
      }
    });
  }

  loadEntrepots(): void {
    this.entrepotService.getAll().subscribe({
      next: (data) => {
        this.entrepots = data;
      }
    });
  }

  valider(): void {
    if (!this.commande) return;

    this.confirmationService.confirm({
      message: `Valider la commande ${this.commande.numero} ?`,
      header: 'Confirmation',
      icon: 'pi pi-check',
      accept: () => {
        this.commandeService.valider(this.commande!.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Commande validée avec succès'
            });
            this.loadCommande(this.commande!.id!);
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

  openReceptionDialog(): void {
    if (!this.commande) return;

    // Initialiser le tableau des produits avec les dates de péremption vides
    this.produitsReception = this.commande.detail_commande_achats?.map(detail => ({
      detail_commande_achat_id: detail.id,
      produit_nom: detail.produit?.nom,
      produit_code: detail.produit?.code,
      quantite: detail.quantite,
      date_peremption: null
    })) || [];

    this.selectedEntrepot = null;
    this.showReceptionDialog = true;
  }

  receptionner(): void {
    if (!this.commande || !this.selectedEntrepot) return;

    this.showReceptionDialog = false;
    this.loading = true;

    const data = {
      entrepot_id: this.selectedEntrepot,
      produits: this.produitsReception.map(p => ({
        detail_commande_achat_id: p.detail_commande_achat_id,
        date_peremption: p.date_peremption ? this.formatDate(p.date_peremption) : null
      }))
    };

    this.commandeService.receptionner(this.commande.id!, data).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Commande réceptionnée avec succès'
        });
        this.loading = false;
        this.loadCommande(this.commande!.id!);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.error?.message || 'Erreur lors de la réception'
        });
        this.loading = false;
      }
    });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  retour(): void {
    this.router.navigate(['/commandes-achat']);
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }

  getStatutSeverity(statut: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' {
  const severityMap: Record<string, 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast'> = {
    'Brouillon': 'info',
    'Validée': 'warning',
    'EnCours': 'contrast',
    'Reçue': 'success',
    'Annulée': 'danger'
  };
  return severityMap[statut] || 'info';
}
}