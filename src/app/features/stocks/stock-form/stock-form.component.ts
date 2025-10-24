import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StockService, EntrepotService } from '../../../core/services/all-services';
import { Produit, Entrepot } from '../../../core/models';
import { MessageService } from 'primeng/api';
import { ProduitService } from '../../../core/services/produit.service';

@Component({
  selector: 'app-stock-form',
  templateUrl: './stock-form.component.html',
  styleUrls: ['./stock-form.component.scss']
})
export class StockFormComponent implements OnInit {
  @Output() formSubmitted = new EventEmitter<void>();

  stockForm!: FormGroup;
  loading = false;
  produits: Produit[] = [];
  entrepots: Entrepot[] = [];

  constructor(
    private fb: FormBuilder,
    private stockService: StockService,
    private produitService: ProduitService,
    private entrepotService: EntrepotService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProduits();
    this.loadEntrepots();
  }

  initForm(): void {
    this.stockForm = this.fb.group({
      produit_id: ['', Validators.required],
      entrepot_id: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      emplacement: ['', Validators.required],
      numero_lot: [''],
      date_peremption: [null]
    });
  }

  loadProduits(): void {
    this.produitService.getAll().subscribe({
      next: (response) => {
        this.produits = response.data;
      }
    });
  }

  loadEntrepots(): void {
    this.entrepotService.getAll().subscribe({
      next: (data) => {
        this.entrepots = data;
      }
    });
  }

  onSubmit(): void {
    if (this.stockForm.invalid) {
      Object.keys(this.stockForm.controls).forEach(key => {
        this.stockForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const formData = this.stockForm.value;

    this.stockService.create(formData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Entrée de stock enregistrée avec succès'
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
    const field = this.stockForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}