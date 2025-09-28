// src/app/features/clients/client-delete-dialog/client-delete-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClientsService } from '../services/clients.service';
import { Client } from '../../../core/models/client.model';

@Component({
  selector: 'app-client-delete-dialog',
  templateUrl: './client-delete-dialog.component.html',
  styleUrls: ['./client-delete-dialog.component.scss']
})
export class ClientDeleteDialogComponent {
  loading = false;

  constructor(
    private clientsService: ClientsService,
    private dialogRef: MatDialogRef<ClientDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public client: Client
  ) {}

  onConfirm(): void {
    this.loading = true;
    
    this.clientsService.deleteClient(this.client.id).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
