// src/app/features/commandes/ligne-commande-form/ligne-commande-form.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Produit } from '../../../core/models/produit.model';

@Component({
  selector: 'app-ligne-commande-form',
  templateUrl: './ligne-commande-form.component.html',
  styleUrls: ['./ligne-commande-form.component.scss']
})
export class LigneCommandeFormComponent implements OnInit {
  @Input() produits: Produit[] = [];
  @Input() ligneForm!: FormGroup;
  @Input() index!: number;
  @Output() remove = new EventEmitter<number>();

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    if (!this.ligneForm) {
      this.ligneForm = this.formBuilder.group({
        produit_id: ['', Validators.required],
        quantite: ['', [Validators.required, Validators.min(0.01)]]
      });
    }
  }

  onRemove(): void {
    this.remove.emit(this.index);
  }

  getProduitById(id: number): Produit | undefined {
    return this.produits.find(p => p.id === id);
  }

  calculateSousTotal(): number {
    const produitId = this.ligneForm.get('produit_id')?.value;
    const quantite = this.ligneForm.get('quantite')?.value || 0;
    const produit = this.getProduitById(produitId);
    return produit ? quantite * produit.prix_unitaire : 0;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  }
}
