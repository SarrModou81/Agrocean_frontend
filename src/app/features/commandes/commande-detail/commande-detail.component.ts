// src/app/features/commandes/commande-detail/commande-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommandesService } from '../services/commandes.service';
import { Commande } from '../../../core/models/commande.model';
import { MatDialog } from '@angular/material/dialog';
import { CommandeStatusDialogComponent } from '../commande-status-dialog/commande-status-dialog.component';

@Component({
  selector: 'app-commande-detail',
  templateUrl: './commande-detail.component.html',
  styleUrls: ['./commande-detail.component.scss']
})
export class CommandeDetailComponent implements OnInit {
  commande: Commande | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commandesService: CommandesService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadCommande(id);
    } else {
      this.router.navigate(['/commandes']);
    }
  }

  private loadCommande(id: number): void {
    this.commandesService.getCommande(id).subscribe({
      next: (commande) => {
        this.commande = commande;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la commande:', error);
        this.router.navigate(['/commandes']);
      }
    });
  }

  openStatusDialog(action: 'confirmer' | 'annuler'): void {
    if (!this.commande) return;

    const dialogRef = this.dialog.open(CommandeStatusDialogComponent, {
      width: '400px',
      data: { commande: this.commande, action }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.commande) {
        this.loadCommande(this.commande.id);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/commandes']);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getStatutColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'En_attente': 'warning',
      'Confirmee': 'info',
      'En_preparation': 'primary',
      'Livree': 'success',
      'Annulee': 'danger'
    };
    return colors[statut] || 'secondary';
  }

  canConfirm(): boolean {
    return this.commande?.statut_commande === 'En_attente';
  }

  canCancel(): boolean {
    return ['En_attente', 'Confirmee'].includes(this.commande?.statut_commande || '');
  }
}
