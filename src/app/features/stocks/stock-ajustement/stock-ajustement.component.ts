import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StockService } from '../../../core/services/all-services';
import { Stock } from '../../../core/models';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-stock-ajustement',
  templateUrl: './stock-ajustement.component.html',
  styleUrls: ['./stock-ajustement.component.scss']
})
export class StockAjustementComponent implements OnInit {
  @Input() stock: Stock | null = null;
  @Output() formSubmitted = new EventEmitter<void>();

  ajustementForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private stockService: StockService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.ajustementForm = this.fb.group({
      ajustement: [0, Validators.required],
      motif: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.ajustementForm.invalid || !this.stock) {
      Object.keys(this.ajustementForm.controls).forEach(key => {
        this.ajustementForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const formData = this.ajustementForm.value;

    this.stockService.ajuster(this.stock.id!, formData.ajustement, formData.motif).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Stock ajusté avec succès'
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

  get nouvelleQuantite(): number {
    if (!this.stock) return 0;
    return this.stock.quantite + (this.ajustementForm.get('ajustement')?.value || 0);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.ajustementForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}