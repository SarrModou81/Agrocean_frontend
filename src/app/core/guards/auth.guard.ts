// src/app/core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      // Vérifier les rôles si spécifiés dans les données de la route
      const requiredRoles = route.data['roles'];
      if (requiredRoles && !this.authService.hasAnyRole(requiredRoles)) {
        this.notificationService.error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
        this.router.navigate(['/dashboard']);
        return false;
      }
      return true;
    }

    this.router.navigate(['/auth/login']);
    return false;
  }
}
