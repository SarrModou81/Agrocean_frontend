// src/app/features/finances/paiement-form/paiement-form.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaiementService, FactureService } from '../../../core/services/finance.service';
import { FactureFournisseurService } from '../../../core/services/facture-fournisseur.service';
import { Facture, FactureFournisseur } from '../../../core/models';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-paiement-form',
  templateUrl: './paiement-form.component.html',
  styleUrls: ['./paiement-form.component.scss']
})
export class PaiementFormComponent implements OnInit {
  @Input() facture: Facture | null = null;
  @Input() factureFournisseur: FactureFournisseur | null = null;
  @Input() typePaiement: 'client' | 'fournisseur' = 'client';
  @Output() formSubmitted = new EventEmitter<void>();

  paiementForm!: FormGroup;
  loading = false;
  factures: Facture[] = [];
  facturesFournisseurs: FactureFournisseur[] = [];
  montantRestant: number = 0;
  montantTotal: number = 0;
  montantPaye: number = 0;

  modes = [
    { label: 'Espèces', value: 'Espèces' },
    { label: 'Chèque', value: 'Chèque' },
    { label: 'Virement', value: 'Virement' },
    { label: 'Mobile Money', value: 'MobileMoney' },
    { label: 'Carte', value: 'Carte' }
  ];

  // Exposer Math pour l'utiliser dans le template
  Math = Math;

  constructor(
    private fb: FormBuilder,
    private paiementService: PaiementService,
    private factureService: FactureService,
    private factureFournisseurService: FactureFournisseurService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    if (!this.facture && !this.factureFournisseur) {
      this.loadFactures();
    } else {
      this.calculerMontantRestant();
    }
  }

  initForm(): void {
    let factureId = null;
    let factureFournisseurId = null;
    let montantDefaut = 0;

    if (this.typePaiement === 'client' && this.facture) {
      factureId = this.facture.id;
      montantDefaut = this.facture.montant_restant || this.facture.montant_ttc || 0;
    } else if (this.typePaiement === 'fournisseur' && this.factureFournisseur) {
      factureFournisseurId = this.factureFournisseur.id;
      montantDefaut = this.factureFournisseur.montant_restant || this.factureFournisseur.montant_total || 0;
    }
    
    this.paiementForm = this.fb.group({
      facture_id: [factureId, this.typePaiement === 'client' && !this.facture ? Validators.required : []],
      facture_fournisseur_id: [factureFournisseurId, this.typePaiement === 'fournisseur' && !this.factureFournisseur ? Validators.required : []],
      montant: [montantDefaut, [Validators.required, Validators.min(0.01)]],
      date_paiement: [new Date(), Validators.required],
      mode_paiement: ['', Validators.required],
      reference: ['']
    });

    // Écouter les changements de facture client
    if (this.typePaiement === 'client' && !this.facture) {
      this.paiementForm.get('facture_id')?.valueChanges.subscribe(factureId => {
        if (factureId) {
          const selectedFacture = this.factures.find(f => f.id === factureId);
          if (selectedFacture) {
            this.calculerMontantRestantFromFacture(selectedFacture);
          }
        }
      });
    }

    // Écouter les changements de facture fournisseur
    if (this.typePaiement === 'fournisseur' && !this.factureFournisseur) {
      this.paiementForm.get('facture_fournisseur_id')?.valueChanges.subscribe(factureId => {
        if (factureId) {
          const selectedFacture = this.facturesFournisseurs.find(f => f.id === factureId);
          if (selectedFacture) {
            this.calculerMontantRestantFromFactureFournisseur(selectedFacture);
          }
        }
      });
    }

    // Valider le montant en temps réel
    this.paiementForm.get('montant')?.valueChanges.subscribe(montant => {
      this.validerMontant(montant);
    });
  }

  calculerMontantRestant(): void {
    if (this.typePaiement === 'client' && this.facture) {
      this.calculerMontantRestantFromFacture(this.facture);
    } else if (this.typePaiement === 'fournisseur' && this.factureFournisseur) {
      this.calculerMontantRestantFromFactureFournisseur(this.factureFournisseur);
    }
  }

  calculerMontantRestantFromFacture(facture: any): void {
    this.montantTotal = facture.montant_ttc || 0;
    this.montantPaye = facture.montant_paye || 0;
    this.montantRestant = this.montantTotal - this.montantPaye;
    
    // Arrondir à 2 décimales
    this.montantRestant = Math.round(this.montantRestant * 100) / 100;
    
    // Si le montant restant est très petit (< 1 FCFA), le mettre à 0
    if (Math.abs(this.montantRestant) < 1) {
      this.montantRestant = 0;
    }
    
    this.paiementForm.patchValue({ montant: this.montantRestant });
  }

  calculerMontantRestantFromFactureFournisseur(facture: any): void {
    this.montantTotal = facture.montant_total || 0;
    this.montantPaye = facture.montant_paye || 0;
    this.montantRestant = this.montantTotal - this.montantPaye;
    
    // Arrondir à 2 décimales
    this.montantRestant = Math.round(this.montantRestant * 100) / 100;
    
    // Si le montant restant est très petit (< 1 FCFA), le mettre à 0
    if (Math.abs(this.montantRestant) < 1) {
      this.montantRestant = 0;
    }
    
    this.paiementForm.patchValue({ montant: this.montantRestant });
  }

  validerMontant(montant: number): void {
    if (!montant || montant <= 0) return;

    const montantArrondi = Math.round(montant * 100) / 100;
    
    if (montantArrondi > this.montantRestant) {
      this.paiementForm.get('montant')?.setErrors({ 
        montantSuperieur: true,
        montantMax: this.montantRestant
      });
    } else {
      // Supprimer l'erreur custom si elle existe
      const errors = this.paiementForm.get('montant')?.errors;
      if (errors && errors['montantSuperieur']) {
        delete errors['montantSuperieur'];
        delete errors['montantMax'];
        this.paiementForm.get('montant')?.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    }
  }

  loadFactures(): void {
    if (this.typePaiement === 'client') {
      this.factureService.impayees().subscribe({
        next: (data: any) => {
          this.factures = Array.isArray(data) ? data : (data.factures || data.data || []);
          this.factures = this.factures.map(f => ({
            ...f,
            montant_paye: f.montant_paye || 0,
            montant_restant: (f.montant_ttc || 0) - (f.montant_paye || 0)
          }));
        },
        error: (error) => {
          console.error('Erreur chargement factures:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors du chargement des factures'
          });
        }
      });
    } else {
      this.factureFournisseurService.impayees().subscribe({
        next: (data: any) => {
          this.facturesFournisseurs = Array.isArray(data) ? data : (data.factures || data.data || []);
          this.facturesFournisseurs = this.facturesFournisseurs.map(f => ({
            ...f,
            montant_paye: f.montant_paye || 0,
            montant_restant: (f.montant_total || 0) - (f.montant_paye || 0)
          }));
        },
        error: (error) => {
          console.error('Erreur chargement factures fournisseurs:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors du chargement des factures fournisseurs'
          });
        }
      });
    }
  }

  onSubmit(): void {
    if (this.paiementForm.invalid) {
      Object.keys(this.paiementForm.controls).forEach(key => {
        this.paiementForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Vérification finale du montant
    const montant = this.paiementForm.value.montant;
    if (montant > this.montantRestant) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: `Le montant ne peut pas dépasser ${this.formatCurrency(this.montantRestant)}`
      });
      return;
    }

    this.loading = true;
    const formData = {
      ...this.paiementForm.value,
      date_paiement: this.formatDate(this.paiementForm.value.date_paiement),
      montant: Math.round(montant * 100) / 100 // Arrondir à 2 décimales
    };

    // Nettoyer les champs non utilisés
    if (this.typePaiement === 'client') {
      delete formData.facture_fournisseur_id;
    } else {
      delete formData.facture_id;
    }

    this.paiementService.create(formData).subscribe({
      next: (response: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Paiement enregistré avec succès'
        });
        
        // Afficher le nouveau montant restant si disponible
        if (response.nouveau_montant_restant !== undefined) {
          const newRestant = response.nouveau_montant_restant;
          if (newRestant === 0) {
            this.messageService.add({
              severity: 'info',
              summary: 'Information',
              detail: 'La facture est maintenant entièrement payée'
            });
          } else {
            this.messageService.add({
              severity: 'info',
              summary: 'Information',
              detail: `Montant restant : ${this.formatCurrency(newRestant)}`
            });
          }
        }
        
        this.loading = false;
        this.paiementForm.reset();
        this.formSubmitted.emit();
      },
      error: (error) => {
        console.error('Erreur paiement:', error);
        
        let errorMessage = 'Une erreur est survenue';
        
        if (error.error?.error) {
          errorMessage = error.error.error;
          
          // Si c'est une erreur de montant supérieur, afficher les détails
          if (error.error.montant_restant !== undefined) {
            errorMessage += `\nMontant restant : ${this.formatCurrency(error.error.montant_restant)}`;
          }
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: errorMessage,
          life: 5000
        });
        this.loading = false;
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.paiementForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getMontantError(): string | null {
    const montantControl = this.paiementForm.get('montant');
    if (montantControl?.errors) {
      if (montantControl.errors['required']) {
        return 'Le montant est requis';
      }
      if (montantControl.errors['min']) {
        return 'Le montant doit être supérieur à 0';
      }
      if (montantControl.errors['montantSuperieur']) {
        return `Le montant ne peut pas dépasser ${this.formatCurrency(this.montantRestant)}`;
      }
    }
    return null;
  }

  formatCurrency(value: number): string {
    if (value === undefined || value === null) return '0 FCFA';
    return Math.round(value).toLocaleString('fr-FR') + ' FCFA';
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }
}