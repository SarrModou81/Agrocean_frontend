import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProduitsService } from '../services/produits.service';
import { Produit } from '../../../core/models/produit.model';

@Component({
  selector: 'app-produit-delete-dialog',
  templateUrl: './produit-delete-dialog.component.html',
  styleUrls: ['./produit-delete-dialog.component.scss']
})
export class ProduitDeleteDialogComponent {
  loading = false;

  constructor(
    private produitsService: ProduitsService,
    private dialogRef: MatDialogRef<ProduitDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public produit: Produit
  ) {}

  onConfirm(): void {
    this.loading = true;
    
    this.produitsService.deleteProduit(this.produit.id).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}