import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProduitsService } from '../services/produits.service';
import { Produit } from '../../../core/models/produit.model';

export interface ProduitFormData {
  mode: 'create' | 'edit';
  produit?: Produit;
}

@Component({
  selector: 'app-produit-form',
  templateUrl: './produit-form.component.html',
  styleUrls: ['./produit-form.component.scss']
})
export class ProduitFormComponent implements OnInit {
  produitForm: FormGroup;
  loading = false;
  
  categories = [
    { value: 'Fruit', label: 'Fruits' },
    { value: 'Legume', label: 'Légumes' },
    { value: 'Poisson', label: 'Poissons' },
    { value: 'Crustace', label: 'Crustacés' },
    { value: 'Halieutique', label: 'Halieutiques' }
  ];

  unites = [
    { value: 'kg', label: 'Kilogramme' },
    { value: 'paquet', label: 'Paquet' },
    { value: 'piece', label: 'Pièce' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private produitsService: ProduitsService,
    private dialogRef: MatDialogRef<ProduitFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProduitFormData
  ) {
    this.produitForm = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      code_produit: ['', [Validators.required, Validators.minLength(3)]],
      categorie: ['', Validators.required],
      unite_mesure: ['', Validators.required],
      prix_unitaire: ['', [Validators.required, Validators.min(0)]],
      duree_conservation: ['', [Validators.required, Validators.min(1)]],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.produit) {
      this.produitForm.patchValue(this.data.produit);
    }
  }

  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

  get title(): string {
    return this.isEditMode ? 'Modifier le produit' : 'Nouveau produit';
  }

  onSubmit(): void {
    if (this.produitForm.valid) {
      this.loading = true;
      const produitData = this.produitForm.value;

      const operation = this.isEditMode
        ? this.produitsService.updateProduit(this.data.produit!.id, produitData)
        : this.produitsService.createProduit(produitData);

      operation.subscribe({
        next: (result) => {
          this.dialogRef.close(result);
        },
        error: (error) => {
          console.error('Erreur lors de la sauvegarde:', error);
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
    Object.keys(this.produitForm.controls).forEach(key => {
      const control = this.produitForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(field: string): string {
    const control = this.produitForm.get(field);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(field)} est requis`;
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength']?.requiredLength;
      return `Minimum ${requiredLength} caractères`;
    }
    if (control?.hasError('min')) {
      return 'La valeur doit être positive';
    }
    return '';
  }

  private getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      nom: 'Nom',
      code_produit: 'Code produit',
      categorie: 'Catégorie',
      unite_mesure: 'Unité de mesure',
      prix_unitaire: 'Prix unitaire',
      duree_conservation: 'Durée de conservation'
    };
    return labels[field] || field;
  }
}