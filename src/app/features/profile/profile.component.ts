import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  loading = false;
  changingPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.initForms();
  }

  loadUser(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
      this.profileForm.patchValue({
        name: this.user.name,
        email: this.user.email,
        telephone: this.user.telephone || ''
      });
    }
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      telephone: ['', [Validators.pattern(/^[0-9+\s-()]+$/)]]
    });

    this.passwordForm = this.fb.group({
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      new_password_confirmation: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('new_password')?.value;
    const confirmation = group.get('new_password_confirmation')?.value;
    return newPassword === confirmation ? null : { passwordMismatch: true };
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez remplir correctement le formulaire'
      });
      return;
    }

    this.loading = true;
    const profileData = {
      name: this.profileForm.value.name,
      telephone: this.profileForm.value.telephone
    };

    this.authService.updateProfile(profileData).subscribe({
      next: (response) => {
        // Mettre à jour les données locales
        const updatedUser = { ...this.user, ...profileData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.user = updatedUser;

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Profil mis à jour avec succès'
        });
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.error?.message || 'Erreur lors de la mise à jour du profil'
        });
        this.loading = false;
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      if (this.passwordForm.hasError('passwordMismatch')) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Attention',
          detail: 'Les mots de passe ne correspondent pas'
        });
      } else {
        this.messageService.add({
          severity: 'warn',
          summary: 'Attention',
          detail: 'Veuillez remplir correctement le formulaire'
        });
      }
      return;
    }

    this.changingPassword = true;
    this.authService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Mot de passe modifié avec succès'
        });
        this.passwordForm.reset();
        this.changingPassword = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.error?.message || 'Erreur lors du changement de mot de passe'
        });
        this.changingPassword = false;
      }
    });
  }
}
