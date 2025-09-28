// src/app/features/stocks/stock-ajustement-dialog/stock-ajustement-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StocksService } from '../services/stocks.service';
import { Stock } from '../../../core/models/stock.model';

@Component({
  selector: 'app-stock-ajustement-dialog',
  templateUrl: './stock-ajustement-dialog.component.html',
  styleUrls: ['./stock-ajustement-dialog.component.scss']
})
export class StockAjustementDialogComponent implements OnInit {
  ajustementForm: FormGroup;
  loading = false;

  motifs = [
    'Correction d\'inventaire',
    'Produit abîmé',
    'Perte/Vol',
    'Erreur de saisie',
    'Retour client',
    'Autre'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private stocksService: StocksService,
    private dialogRef: MatDialogRef<StockAjustementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public stock: Stock
  ) {
    this.ajustementForm = this.formBuilder.group({
      nouvelle_quantite: [stock.quantite_disponible, [Validators.required, Validators.min(0)]],
      motif: ['', Validators.required],
      justification: ['']
    });
  }

  ngOnInit(): void {}

  get differenceQuantite(): number {
    const nouvelleQuantite = this.ajustementForm.get('nouvelle_quantite')?.value || 0;
    return nouvelleQuantite - this.stock.quantite_disponible;
  }

  get typeAjustement(): string {
    const diff = this.differenceQuantite;
    if (diff > 0) return 'Augmentation';
    if (diff < 0) return 'Diminution';
    return 'Aucun changement';
  }

  onSubmit(): void {
    if (this.ajustementForm.valid) {
      this.loading = true;
      const ajustementData = this.ajustementForm.value;

      this.stocksService.ajusterStock(this.stock.id, ajustementData).subscribe({
        next: (result) => {
          this.dialogRef.close(result);
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajustement:', error);
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.ajustementForm.controls).forEach(key => {
      const control = this.ajustementForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(field: string): string {
    const control = this.ajustementForm.get(field);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(field)} est requis`;
    }
    if (control?.hasError('min')) {
      return 'La quantité ne peut pas être négative';
    }
    return '';
  }

  private getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      nouvelle_quantite: 'Nouvelle quantité',
      motif: 'Motif'
    };
    return labels[field] || field;
  }
}