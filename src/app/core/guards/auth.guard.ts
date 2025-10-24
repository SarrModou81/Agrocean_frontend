import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      // Vérifier les rôles si spécifiés
      const allowedRoles = route.data['roles'] as string[];
      
      if (allowedRoles && allowedRoles.length > 0) {
        if (!this.authService.hasRole(allowedRoles)) {
          this.router.navigate(['/dashboard']);
          return false;
        }
      }
      
      return true;
    }

    // Non authentifié, redirection vers login
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
