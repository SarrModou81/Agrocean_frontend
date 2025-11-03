import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MessageService } from 'primeng/api';

interface TestAccount {
  role: string;
  email: string;
  icon: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  returnUrl: string = '/dashboard';

  // Comptes de test avec icônes
  testAccounts: TestAccount[] = [
    {
      role: 'Administrateur',
      email: 'admin@agrocean.sn',
      icon: 'pi pi-shield'
    },
    {
      role: 'Commercial',
      email: 'commercial@agrocean.sn',
      icon: 'pi pi-users'
    },
    {
      role: 'Gestionnaire',
      email: 'gestionnaire@agrocean.sn',
      icon: 'pi pi-box'
    },
    {
      role: 'Comptable',
      email: 'comptable@agrocean.sn',
      icon: 'pi pi-dollar'
    },
    {
      role: 'Approvisionnement',
      email: 'appro@agrocean.sn',
      icon: 'pi pi-shopping-cart'
    }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Vérifier si déjà connecté
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
      return;
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Récupérer l'URL de retour
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Connexion réussie',
          detail: `Bienvenue ${response.user.prenom} ${response.user.nom}`,
          life: 3000
        });
        
        // Petit délai pour l'effet visuel
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 500);
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur de connexion',
          detail: error.error?.error || 'Identifiants invalides',
          life: 4000
        });
      }
    });
  }
}