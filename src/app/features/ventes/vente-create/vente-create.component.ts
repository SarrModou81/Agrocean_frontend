// src/app/features/ventes/vente-create/vente-create.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VenteService, ClientService } from '../../../core/services/all-services';
import { Client, Produit } from '../../../core/models';
import { MessageService } from 'primeng/api';
import { ProduitService } from '../../../core/services/produit.service';

@Component({
  selector: 'app-vente-create',
  templateUrl: './vente-create.component.html',
  styleUrls: ['./vente-create.component.scss']
})
export class VenteCreateComponent implements OnInit {
  venteForm!: FormGroup;
  loading = false;
  clients: Client[] = [];
  produits: Produit[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private venteService: VenteService,
    private clientService: ClientService,
    private produitService: ProduitService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
    this.loadProduits();
  }

  initForm(): void {
    this.venteForm = this.fb.group({
      client_id: ['', Validators.required],
      date_vente: [new Date(), Validators.required],
      remise: [0, [Validators.min(0)]],
      produits: this.fb.array([this.createLigneProduit()])
    });

    // Observer les changements de produits pour mettre à jour les prix
    this.produitsArray.valueChanges.subscribe(() => {
      this.updatePrix();
    });
  }

  createLigneProduit(): FormGroup {
    return this.fb.group({
      produit_id: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prix_unitaire: [0, [Validators.required, Validators.min(0)]]
    });
  }

  loadClients(): void {
    this.clientService.getAll().subscribe({
      next: (response) => {
        this.clients = response.data;
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
    return this.venteForm.get('produits') as FormArray;
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
            prix_unitaire: produit.prix_vente
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

  get sousTotal(): number {
    let total = 0;
    for (let i = 0; i < this.produitsArray.length; i++) {
      total += this.calculerSousTotal(i);
    }
    return total;
  }

  get remise(): number {
    return this.venteForm.get('remise')?.value || 0;
  }

  get totalHT(): number {
    return this.sousTotal - this.remise;
  }

  get tva(): number {
    return this.totalHT * 0.18;
  }

  get totalTTC(): number {
    return this.totalHT + this.tva;
  }

  onSubmit(): void {
    if (this.venteForm.invalid) {
      Object.keys(this.venteForm.controls).forEach(key => {
        this.venteForm.get(key)?.markAsTouched();
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
      ...this.venteForm.value,
      date_vente: this.formatDate(this.venteForm.value.date_vente)
    };

    this.venteService.create(formData).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Vente créée avec succès'
        });
        this.loading = false;
        this.router.navigate(['/ventes', response.vente.id]);
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
    this.router.navigate(['/ventes']);
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}