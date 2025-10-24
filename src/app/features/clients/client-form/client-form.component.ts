import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from '../../../core/services/all-services';
import { Client } from '../../../core/models';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss']
})
export class ClientFormComponent implements OnInit {
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

  initForm(): void {
    this.clientForm = this.fb.group({
      nom: [this.client?.nom || '', Validators.required],
      email: [this.client?.email || '', Validators.email],
      telephone: [this.client?.telephone || '', Validators.required],
      adresse: [this.client?.adresse || '', Validators.required],
      type: [this.client?.type || 'Menage', Validators.required],
      credit_max: [this.client?.credit_max || 0, [Validators.required, Validators.min(0)]],
      solde: [{ value: this.client?.solde || 0, disabled: true }]
    });
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