// src/app/features/clients/client-form/client-form.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClientsService } from '../services/clients.service';
import { Client } from '../../../core/models/client.model';

export interface ClientFormData {
  mode: 'create' | 'edit';
  client?: Client;
}

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss']
})
export class ClientFormComponent implements OnInit {
  clientForm: FormGroup;
  loading = false;

  typesClient = [
    { value: 'Menage', label: 'Ménage' },
    { value: 'Restaurant', label: 'Restaurant' },
    { value: 'Boutique', label: 'Boutique' },
    { value: 'GrandeSurface', label: 'Grande Surface' },
    { value: 'Institution', label: 'Institution' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private clientsService: ClientsService,
    private dialogRef: MatDialogRef<ClientFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClientFormData
  ) {
    this.clientForm = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      adresse: ['', [Validators.required, Validators.minLength(5)]],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]+$/)]],
      email: ['', [Validators.email]],
      type_client: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.client) {
      this.clientForm.patchValue(this.data.client);
    }
  }

  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

  get title(): string {
    return this.isEditMode ? 'Modifier le client' : 'Nouveau client';
  }

  onSubmit(): void {
    if (this.clientForm.valid) {
      this.loading = true;
      const clientData = {
        ...this.clientForm.value,
        date_creation: this.isEditMode ? this.data.client!.date_creation : new Date().toISOString().split('T')[0]
      };

      const operation = this.isEditMode
        ? this.clientsService.updateClient(this.data.client!.id, clientData)
        : this.clientsService.createClient(clientData);

      operation.subscribe({
        next: (result) => {
          this.dialogRef.close(result);
        },
        error: (error) => {
          console.error('Erreur lors de la sauvegarde:', error);
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
    Object.keys(this.clientForm.controls).forEach(key => {
      const control = this.clientForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(field: string): string {
    const control = this.clientForm.get(field);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(field)} est requis`;
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength']?.requiredLength;
      return `Minimum ${requiredLength} caractères`;
    }
    if (control?.hasError('email')) {
      return 'Email invalide';
    }
    if (control?.hasError('pattern')) {
      return 'Format de téléphone invalide';
    }
    return '';
  }

  private getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      nom: 'Nom',
      adresse: 'Adresse',
      telephone: 'Téléphone',
      email: 'Email',
      type_client: 'Type de client'
    };
    return labels[field] || field;
  }
}
