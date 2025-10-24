// src/app/features/utilisateurs/utilisateur-form/utilisateur-form.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/all-services';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-utilisateur-form',
  templateUrl: './utilisateur-form.component.html',
  styleUrls: ['./utilisateur-form.component.scss']
})
export class UtilisateurFormComponent implements OnInit {
  @Input() utilisateur: any = null;
  @Input() isEditing = false;
  @Output() formSubmitted = new EventEmitter<void>();

  utilisateurForm!: FormGroup;
  loading = false;

  roles = [
    { label: 'Administrateur', value: 'Administrateur' },
    { label: 'Commercial', value: 'Commercial' },
    { label: 'Gestionnaire Stock', value: 'GestionnaireStock' },
    { label: 'Comptable', value: 'Comptable' },
    { label: 'Agent Approvisionnement', value: 'AgentApprovisionnement' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.utilisateurForm = this.fb.group({
      nom: [this.utilisateur?.nom || '', Validators.required],
      prenom: [this.utilisateur?.prenom || '', Validators.required],
      email: [this.utilisateur?.email || '', [Validators.required, Validators.email]],
      telephone: [this.utilisateur?.telephone || ''],
      role: [this.utilisateur?.role || 'Commercial', Validators.required],
      password: ['', this.isEditing ? [] : [Validators.required, Validators.minLength(6)]],
      is_active: [this.utilisateur?.is_active !== false]
    });
  }

  onSubmit(): void {
    if (this.utilisateurForm.invalid) {
      Object.keys(this.utilisateurForm.controls).forEach(key => {
        this.utilisateurForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const formData = { ...this.utilisateurForm.value };

    // Ne pas envoyer le mot de passe s'il est vide en mode édition
    if (this.isEditing && !formData.password) {
      delete formData.password;
    }

    const request = this.isEditing && this.utilisateur?.id
      ? this.userService.update(this.utilisateur.id, formData)
      : this.userService.create(formData);

    request.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `Utilisateur ${this.isEditing ? 'modifié' : 'créé'} avec succès`
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
    const field = this.utilisateurForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}