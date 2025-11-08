import { Component, OnInit } from '@angular/core';
import { FactureService } from '../../../core/services/all-services';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-creances-list',
  template: `
    <div class="creances-container">
      <p-card header="Gestion des Créances">
        <p-table [value]="creances" [loading]="loading">
          <ng-template pTemplate="header">
            <tr>
              <th>Client</th>
              <th>Montant Dû</th>
              <th>Retard (jours)</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-creance>
            <tr>
              <td>{{ creance.client }}</td>
              <td>{{ formatCurrency(creance.montant) }}</td>
              <td>
                <p-tag 
                  [value]="creance.retard + ' jours'" 
                  [severity]="creance.retard > 30 ? 'danger' : 'warning'"
                ></p-tag>
              </td>
              <td>
                <button pButton icon="pi pi-phone" class="p-button-text"></button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `,
  styles: [`
    .creances-container { padding: 0; }
  `]
})
export class CreancesListComponent implements OnInit {
  creances: any[] = [];
  loading = false;

  constructor(
    private factureService: FactureService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadCreances();
  }

  loadCreances(): void {
    this.loading = true;
    this.factureService.impayees().subscribe({
      next: (data: any) => {
        this.creances = data.map((f: any) => ({
          client: f.vente?.client?.nom,
          montant: f.montant_restant || f.montant_ttc,
          retard: f.jours_retard || 0
        }));
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement'
        });
        this.loading = false;
      }
    });
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }
}