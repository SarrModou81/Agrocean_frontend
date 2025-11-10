import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from '../../../core/services/all-services';
import { Client } from '../../../core/models';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss']
})
export class ClientFormComponent implements OnInit, OnChanges {
  @Input() client: Client | null = null;
  @Input() isEditing = false;
  @Output() formSubmitted = new EventEmitter<void>();

  clientForm!: FormGroup;
  loading = false;

  types = [
    { label: 'Ménage', value: 'Menage' },
    { label: 'Boutique', value: 'Boutique' },
    { label: 'Grande Surface', value: 'GrandeSurface' },
    { label: 'Restaurant', value: 'Restaurant' },
    { label: 'Institution', value: 'Institution' }
  ];

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['client'] && this.clientForm) {
      this.updateForm();
    }
  }

  initForm(): void {
    this.clientForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', Validators.email],
      telephone: ['', Validators.required],
      adresse: ['', Validators.required],
      type: ['Menage', Validators.required],
      credit_max: [0, [Validators.required, Validators.min(0)]],
      solde: [{ value: 0, disabled: true }]
    });

    if (this.client) {
      this.updateForm();
    }
  }

  updateForm(): void {
    if (this.client) {
      this.clientForm.patchValue({
        nom: this.client.nom,
        email: this.client.email || '',
        telephone: this.client.telephone,
        adresse: this.client.adresse,
        type: this.client.type,
        credit_max: this.client.credit_max,
        solde: this.client.solde
      });
    }
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      Object.keys(this.clientForm.controls).forEach(key => {
        this.clientForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const formData = this.clientForm.getRawValue();

    const request = this.isEditing && this.client?.id
      ? this.clientService.update(this.client.id, formData)
      : this.clientService.create(formData);

    request.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `Client ${this.isEditing ? 'modifié' : 'créé'} avec succès`
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
    const field = this.clientForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}