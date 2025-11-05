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

  modes = [
    { label: 'Espèces', value: 'Espèces' },
    { label: 'Chèque', value: 'Chèque' },
    { label: 'Virement', value: 'Virement' },
    { label: 'Mobile Money', value: 'MobileMoney' },
    { label: 'Carte', value: 'Carte' }
  ];

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
    }
  }

  initForm(): void {
    let montantMax = 0;
    let factureId = null;
    let factureFournisseurId = null;

    if (this.typePaiement === 'client' && this.facture) {
      montantMax = this.facture.montant_restant || this.facture.montant_ttc || 0;
      factureId = this.facture.id;
    } else if (this.typePaiement === 'fournisseur' && this.factureFournisseur) {
      montantMax = this.factureFournisseur.montant_restant || this.factureFournisseur.montant_total || 0;
      factureFournisseurId = this.factureFournisseur.id;
    }
    
    this.paiementForm = this.fb.group({
      facture_id: [factureId, this.typePaiement === 'client' && !this.facture ? Validators.required : []],
      facture_fournisseur_id: [factureFournisseurId, this.typePaiement === 'fournisseur' && !this.factureFournisseur ? Validators.required : []],
      montant: [montantMax, [Validators.required, Validators.min(1)]],
      date_paiement: [new Date(), Validators.required],
      mode_paiement: ['', Validators.required],
      reference: ['']
    });

    // Écouter les changements de facture
    if (this.typePaiement === 'client' && !this.facture) {
      this.paiementForm.get('facture_id')?.valueChanges.subscribe(factureId => {
        const selectedFacture = this.factures.find(f => f.id === factureId);
        if (selectedFacture) {
          const montantRestant = selectedFacture.montant_restant || selectedFacture.montant_ttc;
          this.paiementForm.patchValue({ montant: montantRestant });
        }
      });
    }

    // Écouter les changements de facture fournisseur
    if (this.typePaiement === 'fournisseur' && !this.factureFournisseur) {
      this.paiementForm.get('facture_fournisseur_id')?.valueChanges.subscribe(factureId => {
        const selectedFacture = this.facturesFournisseurs.find(f => f.id === factureId);
        if (selectedFacture) {
          const montantRestant = selectedFacture.montant_restant || selectedFacture.montant_total;
          this.paiementForm.patchValue({ montant: montantRestant });
        }
      });
    }
  }

  loadFactures(): void {
    if (this.typePaiement === 'client') {
      this.factureService.impayees().subscribe({
        next: (data: any) => {
          this.factures = Array.isArray(data) ? data : (data.factures || data.data || []);
          this.factures = this.factures.map(f => ({
            ...f,
            montant_restant: f.montant_restant || f.montant_ttc
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
            montant_restant: f.montant_restant || f.montant_total
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

    this.loading = true;
    const formData = {
      ...this.paiementForm.value,
      date_paiement: this.formatDate(this.paiementForm.value.date_paiement)
    };

    // Nettoyer les champs non utilisés
    if (this.typePaiement === 'client') {
      delete formData.facture_fournisseur_id;
    } else {
      delete formData.facture_id;
    }

    this.paiementService.create(formData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Paiement enregistré avec succès'
        });
        this.loading = false;
        this.paiementForm.reset();
        this.formSubmitted.emit();
      },
      error: (error) => {
        console.error('Erreur paiement:', error);
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
    const field = this.paiementForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  formatCurrency(value: number): string {
    if (value === undefined || value === null) return '0 FCFA';
    return value.toLocaleString('fr-FR') + ' FCFA';
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }
}