// src/app/core/interceptors/error.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private loadingService: LoadingService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        this.loadingService.hide();
        
        let errorMessage = 'Une erreur est survenue';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.errors) {
          // Gestion des erreurs de validation Laravel
          const errors = error.error.errors;
          errorMessage = Object.values(errors).flat().join(', ');
        }
        
        switch (error.status) {
          case 401:
            // Token expiré ou invalide
            this.authService.logout();
            this.router.navigate(['/auth/login']);
            this.notificationService.error('Session expirée. Veuillez vous reconnecter.');
            break;
          case 403:
            this.notificationService.error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
            break;
          case 404:
            this.notificationService.error('Ressource non trouvée');
            break;
          case 422:
            this.notificationService.error(errorMessage);
            break;
          case 500:
            this.notificationService.error('Erreur serveur. Veuillez réessayer plus tard.');
            break;
          default:
            this.notificationService.error(errorMessage);
        }
        
        return throwError(() => error);
      })
    );
  }
}