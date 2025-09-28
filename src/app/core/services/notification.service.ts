// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private defaultConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top'
  };

  constructor(private snackBar: MatSnackBar) {}

  success(message: string, config?: MatSnackBarConfig): void {
    this.snackBar.open(message, 'Fermer', {
      ...this.defaultConfig,
      ...config,
      panelClass: ['snackbar-success']
    });
  }

  error(message: string, config?: MatSnackBarConfig): void {
    this.snackBar.open(message, 'Fermer', {
      ...this.defaultConfig,
      duration: 5000,
      ...config,
      panelClass: ['snackbar-error']
    });
  }

  warning(message: string, config?: MatSnackBarConfig): void {
    this.snackBar.open(message, 'Fermer', {
      ...this.defaultConfig,
      ...config,
      panelClass: ['snackbar-warning']
    });
  }

  info(message: string, config?: MatSnackBarConfig): void {
    this.snackBar.open(message, 'Fermer', {
      ...this.defaultConfig,
      ...config,
      panelClass: ['snackbar-info']
    });
  }
}