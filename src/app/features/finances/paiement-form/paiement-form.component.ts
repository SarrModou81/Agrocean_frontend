import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaiementService, FactureService } from '../../../core/services/all-services';
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
  }

loadFacturesImpayees(): void {
  this.factureService.impayees().subscribe({
    next: (data: any) => {
      // Gérer les deux formats possibles de réponse
      this.factures = Array.isArray(data) ? data : (data.factures || data.data || []);
      console.log('Factures chargées:', this.factures);
    },
    error: (error) => {
      console.error('Erreur:', error);
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
    const field = this.paiementForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}