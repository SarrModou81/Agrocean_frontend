import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaiementService, FactureService } from '../../../core/services/finance.service';
import { Facture } from '../../../core/models';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-paiement-form',
  templateUrl: './paiement-form.component.html',
  styleUrls: ['./paiement-form.component.scss']
})
export class PaiementFormComponent implements OnInit {
  @Input() facture: Facture | null = null;
  @Output() formSubmitted = new EventEmitter<void>();

  paiementForm!: FormGroup;
  loading = false;
  factures: Facture[] = [];

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
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    if (!this.facture) {
      this.loadFacturesImpayees();
    }
  }

  initForm(): void {
    const montantMax = this.facture?.montant_restant || this.facture?.montant_ttc || 0;
    
    this.paiementForm = this.fb.group({
      facture_id: [this.facture?.id || '', this.facture ? [] : Validators.required],
      montant: [montantMax, [Validators.required, Validators.min(1)]],
      date_paiement: [new Date(), Validators.required],
      mode_paiement: ['', Validators.required],
      reference: ['']
    });

    // Écouter les changements de facture pour mettre à jour le montant
    if (!this.facture) {
      this.paiementForm.get('facture_id')?.valueChanges.subscribe(factureId => {
        const selectedFacture = this.factures.find(f => f.id === factureId);
        if (selectedFacture) {
          const montantRestant = selectedFacture.montant_restant || selectedFacture.montant_ttc;
          this.paiementForm.patchValue({ montant: montantRestant });
        }
      });
    }
  }

  loadFacturesImpayees(): void {
    this.factureService.impayees().subscribe({
      next: (data: any) => {
        // Gérer les différents formats possibles de réponse
        this.factures = Array.isArray(data) ? data : (data.factures || data.data || []);
        
        // Calculer le montant restant pour chaque facture
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