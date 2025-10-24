// src/app/features/produits/produit-form/produit-form.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategorieService } from '../../../core/services/all-services';
import { Produit, Categorie } from '../../../core/models';
import { MessageService } from 'primeng/api';
import { ProduitService } from '../../../core/services/produit.service';

@Component({
  selector: 'app-produit-form',
  templateUrl: './produit-form.component.html',
  styleUrls: ['./produit-form.component.scss']
})
export class ProduitFormComponent implements OnInit {
  @Input() produit: Produit | null = null;
  @Input() isEditing = false;
  @Output() formSubmitted = new EventEmitter<void>();

  produitForm!: FormGroup;
  loading = false;
  categories: Categorie[] = [];

  constructor(
    private fb: FormBuilder,
    private produitService: ProduitService,
    private categorieService: CategorieService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.initForm();
  }

  loadCategories(): void {
    this.categorieService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
      }
    });
  }

  initForm(): void {
    this.produitForm = this.fb.group({
      code: [this.produit?.code || '', Validators.required],
      nom: [this.produit?.nom || '', Validators.required],
      description: [this.produit?.description || ''],
      categorie_id: [this.produit?.categorie_id || '', Validators.required],
      prix_achat: [this.produit?.prix_achat || 0, [Validators.required, Validators.min(0)]],
      prix_vente: [this.produit?.prix_vente || 0, [Validators.required, Validators.min(0)]],
      seuil_minimum: [this.produit?.seuil_minimum || 10, [Validators.required, Validators.min(0)]],
      peremption: [this.produit?.peremption || false]
    });
  }

  onSubmit(): void {
    if (this.produitForm.invalid) {
      Object.keys(this.produitForm.controls).forEach(key => {
        this.produitForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const formData = this.produitForm.value;

    const request = this.isEditing && this.produit?.id
      ? this.produitService.update(this.produit.id, formData)
      : this.produitService.create(formData);

    request.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `Produit ${this.isEditing ? 'modifié' : 'créé'} avec succès`
        });
        this.loading = false;
        this.formSubmitted.emit();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.error?.message || 'Une erreur est survenue'
        });
        this.loading = false;
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.produitForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  get marge(): number {
    const prixVente = this.produitForm.get('prix_vente')?.value || 0;
    const prixAchat = this.produitForm.get('prix_achat')?.value || 0;
    return prixVente - prixAchat;
  }

  get tauxMarge(): number {
    const prixAchat = this.produitForm.get('prix_achat')?.value || 0;
    if (prixAchat === 0) return 0;
    return ((this.marge / prixAchat) * 100);
  }
}