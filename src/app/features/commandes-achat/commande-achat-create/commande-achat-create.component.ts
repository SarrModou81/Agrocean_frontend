import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommandeAchatService, FournisseurService } from '../../../core/services/all-services';
import { Fournisseur, Produit } from '../../../core/models';
import { MessageService } from 'primeng/api';
import { ProduitService } from '../../../core/services/produit.service';

@Component({
  selector: 'app-commande-achat-create',
  templateUrl: './commande-achat-create.component.html',
  styleUrls: ['./commande-achat-create.component.scss']
})
export class CommandeAchatCreateComponent implements OnInit {
  commandeForm!: FormGroup;
  loading = false;
  fournisseurs: Fournisseur[] = [];
  produits: Produit[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private commandeService: CommandeAchatService,
    private fournisseurService: FournisseurService,
    private produitService: ProduitService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadFournisseurs();
    this.loadProduits();
  }

  initForm(): void {
    this.commandeForm = this.fb.group({
      fournisseur_id: ['', Validators.required],
      date_commande: [new Date(), Validators.required],
      date_livraison_prevue: [null],
      produits: this.fb.array([this.createLigneProduit()])
    });

    this.produitsArray.valueChanges.subscribe(() => {
      this.updatePrix();
    });
  }

  createLigneProduit(): FormGroup {
    return this.fb.group({
      produit_id: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prix_unitaire: [0, [Validators.required, Validators.min(0)]],
      date_peremption: [null]
    });
  }

  loadFournisseurs(): void {
    this.fournisseurService.getAll().subscribe({
      next: (response) => {
        this.fournisseurs = response.data;
      }
    });
  }

  loadProduits(): void {
    this.produitService.getAll().subscribe({
      next: (response) => {
        this.produits = response.data;
      }
    });
  }

  get produitsArray(): FormArray {
    return this.commandeForm.get('produits') as FormArray;
  }

  ajouterLigne(): void {
    this.produitsArray.push(this.createLigneProduit());
  }

  supprimerLigne(index: number): void {
    if (this.produitsArray.length > 1) {
      this.produitsArray.removeAt(index);
    }
  }

  updatePrix(): void {
    this.produitsArray.controls.forEach((control, index) => {
      const produitId = control.get('produit_id')?.value;
      if (produitId) {
        const produit = this.produits.find(p => p.id === produitId);
        if (produit) {
          control.patchValue({
            prix_unitaire: produit.prix_achat
          }, { emitEvent: false });
        }
      }
    });
  }

  calculerSousTotal(index: number): number {
    const ligne = this.produitsArray.at(index);
    const quantite = ligne.get('quantite')?.value || 0;
    const prixUnitaire = ligne.get('prix_unitaire')?.value || 0;
    return quantite * prixUnitaire;
  }

  get montantTotal(): number {
    let total = 0;
    for (let i = 0; i < this.produitsArray.length; i++) {
      total += this.calculerSousTotal(i);
    }
    return total;
  }

  onSubmit(): void {
    if (this.commandeForm.invalid) {
      Object.keys(this.commandeForm.controls).forEach(key => {
        this.commandeForm.get(key)?.markAsTouched();
      });
      this.produitsArray.controls.forEach(control => {
        Object.keys((control as FormGroup).controls).forEach(key => {
          control.get(key)?.markAsTouched();
        });
      });
      return;
    }

    this.loading = true;
    const formData = {
      ...this.commandeForm.value,
      date_commande: this.formatDate(this.commandeForm.value.date_commande),
      date_livraison_prevue: this.commandeForm.value.date_livraison_prevue
        ? this.formatDate(this.commandeForm.value.date_livraison_prevue)
        : null,
      produits: this.commandeForm.value.produits.map((p: any) => ({
        ...p,
        date_peremption: p.date_peremption ? this.formatDate(p.date_peremption) : null
      }))
    };

    this.commandeService.create(formData).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Commande créée avec succès'
        });
        this.loading = false;
        this.router.navigate(['/commandes-achat', response.commande.id]);
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

  annuler(): void {
    this.router.navigate(['/commandes-achat']);
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}