// src/app/features/commandes/commande-status-dialog/commande-status-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommandesService } from '../services/commandes.service';
import { Commande } from '../../../core/models/commande.model';

export interface StatusDialogData {
  commande: Commande;
  action: 'confirmer' | 'annuler';
}

@Component({
  selector: 'app-commande-status-dialog',
  templateUrl: './commande-status-dialog.component.html',
  styleUrls: ['./commande-status-dialog.component.scss']
})
export class CommandeStatusDialogComponent {
  loading = false;

  constructor(
    private commandesService: CommandesService,
    private dialogRef: MatDialogRef<CommandeStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StatusDialogData
  ) {}

  get title(): string {
    return this.data.action === 'confirmer' ? 'Confirmer la commande' : 'Annuler la commande';
  }

  get message(): string {
    const action = this.data.action === 'confirmer' ? 'confirmer' : 'annuler';
    return `Êtes-vous sûr de vouloir ${action} cette commande ?`;
  }

  get buttonText(): string {
    return this.data.action === 'confirmer' ? 'Confirmer' : 'Annuler la commande';
  }

  get buttonColor(): string {
    return this.data.action === 'confirmer' ? 'primary' : 'warn';
  }

  onConfirm(): void {
    this.loading = true;
    
    const operation = this.data.action === 'confirmer' 
      ? this.commandesService.confirmerCommande(this.data.commande.id)
      : this.commandesService.annulerCommande(this.data.commande.id);

    operation.subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Erreur lors de l\'opération:', error);
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}