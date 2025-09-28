// src/app/features/commandes/commande-form/commande-form.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommandesService, CreateCommandeRequest } from '../services/commandes.service';
import { ApiService } from '../../../core/services/api.service';
import { Client } from '../../../core/models/client.model';
import { Produit } from '../../../core/models/produit.model';

export interface CommandeFormData {
  mode: 'create' | 'edit';
  commande?: any;
}

@Component({
  selector: 'app-commande-form',
  templateUrl: './commande-form.component.html',
  styleUrls: ['./commande-form.component.scss']
})
export class CommandeFormComponent implements OnInit {
  commandeForm: FormGroup;
  loading = false;
  
  clients: Client[] = [];
  produits: Produit[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private commandesService: CommandesService,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<CommandeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CommandeFormData
  ) {
    this.commandeForm = this.formBuilder.group({
      client_id: ['', Validators.required],
      date_livraison_prevue: ['', Validators.required],
      notes: [''],
      lignes: this.formBuilder.array([])
    });
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadProduits();
    this.addLigneCommande(); // Ajouter une ligne par défaut
  }

  get lignesArray(): FormArray {
    return this.commandeForm.get('lignes') as FormArray;
  }

  private loadClients(): void {
    this.apiService.get<Client[]>('clients').subscribe({
      next: (clients) => {
        this.clients = clients;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des clients:', error);
      }
    });
  }

  private loadProduits(): void {
    this.apiService.get<Produit[]>('produits-catalog').subscribe({
      next: (produits) => {
        this.produits = produits;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits:', error);
      }
    });
  }

  addLigneCommande(): void {
    const ligneForm = this.formBuilder.group({
      produit_id: ['', Validators.required],
      quantite: ['', [Validators.required, Validators.min(0.01)]]
    });

    this.lignesArray.push(ligneForm);
  }

  removeLigneCommande(index: number): void {
    if (this.lignesArray.length > 1) {
      this.lignesArray.removeAt(index);
    }
  }

  getProduitById(id: number): Produit | undefined {
    return this.produits.find(p => p.id === id);
  }

  calculateTotal(): number {
    let total = 0;
    this.lignesArray.controls.forEach(control => {
      const produitId = control.get('produit_id')?.value;
      const quantite = control.get('quantite')?.value || 0;
      const produit = this.getProduitById(produitId);
      if (produit) {
        total += quantite * produit.prix_unitaire;
      }
    });
    return total;
  }

  onSubmit(): void {
    if (this.commandeForm.valid) {
      this.loading = true;
      const commandeData: CreateCommandeRequest = this.commandeForm.value;

      this.commandesService.createCommande(commandeData).subscribe({
        next: (result) => {
          this.dialogRef.close(result);
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
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
    Object.keys(this.commandeForm.controls).forEach(key => {
      const control = this.commandeForm.get(key);
      control?.markAsTouched();
    });

    this.lignesArray.controls.forEach(control => {
      Object.keys(control.value).forEach(key => {
        control.get(key)?.markAsTouched();
      });
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  }
}
