import { Component } from '@angular/core';
import { RapportService } from '../../../core/services/all-services';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-rapport-stocks',
  template: `
    <div class="rapport-container">
      <p-card header="Rapport des Stocks">
        <button pButton label="Générer" (click)="generer()" [loading]="loading" class="p-button-primary"></button>
        <div *ngIf="rapport" class="content">
          <p-table [value]="rapport.produits" [paginator]="true" [rows]="10">
            <ng-template pTemplate="header">
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Valeur</th>
                <th>Statut</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-item>
              <tr>
                <td>{{ item.nom }}</td>
                <td>{{ item.quantite }}</td>
                <td>{{ formatCurrency(item.valeur) }}</td>
                <td>
                  <p-tag 
                    [value]="item.quantite > item.seuil ? 'OK' : 'Faible'" 
                    [severity]="item.quantite > item.seuil ? 'success' : 'danger'"
                  ></p-tag>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
        <p-progressBar *ngIf="loading" mode="indeterminate"></p-progressBar>
      </p-card>
    </div>
    <p-toast></p-toast>
  `,
  styles: [`
    .rapport-container {
      padding: 0;
      button { margin-bottom: 1.5rem; }
      .content { padding-top: 1rem; }
    }
  `]
})
export class RapportStocksComponent {
  rapport: any = null;
  loading = false;

  constructor(
    private rapportService: RapportService,
    private messageService: MessageService
  ) {}

  generer(): void {
    this.loading = true;
    this.rapportService.rapportStocks().subscribe({
      next: (data) => {
        this.rapport = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la génération du rapport'
        });
        this.loading = false;
      }
    });
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }
}