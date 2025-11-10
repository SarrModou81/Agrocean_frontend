import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FournisseurService } from '../../../core/services/all-services';
import { Fournisseur } from '../../../core/models';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-fournisseur-form',
  templateUrl: './fournisseur-form.component.html',
  styleUrls: ['./fournisseur-form.component.scss']
})
export class FournisseurFormComponent implements OnInit, OnChanges {
  @Input() fournisseur: Fournisseur | null = null;
  @Input() isEditing = false;
  @Output() formSubmitted = new EventEmitter<void>();

  fournisseurForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private fournisseurService: FournisseurService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fournisseur'] && this.fournisseurForm) {
      if (this.fournisseur) {
        this.updateForm();
      } else {
        // Réinitialiser le formulaire si fournisseur devient null (mode création)
        this.resetForm();
      }
    }
  }

  initForm(): void {
    this.fournisseurForm = this.fb.group({
      nom: ['', Validators.required],
      contact: ['', Validators.required],
      telephone: ['', Validators.required],
      adresse: ['', Validators.required],
      conditions: ['']
    });

    if (this.fournisseur) {
      this.updateForm();
    }
  }

  updateForm(): void {
    if (this.fournisseur) {
      this.fournisseurForm.patchValue({
        nom: this.fournisseur.nom,
        contact: this.fournisseur.contact,
        telephone: this.fournisseur.telephone,
        adresse: this.fournisseur.adresse,
        conditions: this.fournisseur.conditions || ''
      });
    }
  }

  resetForm(): void {
    this.fournisseurForm.reset({
      nom: '',
      contact: '',
      telephone: '',
      adresse: '',
      conditions: ''
    });
  }

  onSubmit(): void {
    if (this.fournisseurForm.invalid) {
      Object.keys(this.fournisseurForm.controls).forEach(key => {
        this.fournisseurForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const formData = this.fournisseurForm.value;

    const request = this.isEditing && this.fournisseur?.id
      ? this.fournisseurService.update(this.fournisseur.id, formData)
      : this.fournisseurService.create(formData);

    request.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `Fournisseur ${this.isEditing ? 'modifié' : 'créé'} avec succès`
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
    const field = this.fournisseurForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}