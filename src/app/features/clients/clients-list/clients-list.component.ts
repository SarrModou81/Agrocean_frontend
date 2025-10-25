import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../../core/services/all-services';
import { Client } from '../../../core/models';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss']
})
export class ClientsListComponent implements OnInit {
  clients: Client[] = [];
  loading = false;
  displayDialog = false;
  selectedClient: Client | null = null;
  isEditing = false;

  totalRecords = 0;
  currentPage = 1;
  pageSize = 20;

  constructor(
    private clientService: ClientService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;
    this.clientService.getAll({ page: this.currentPage, per_page: this.pageSize }).subscribe({
      next: (response) => {
        this.clients = response.data;
        this.totalRecords = response.total;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des clients'
        });
        this.loading = false;
      }
    });
  }

  openNew(): void {
    this.selectedClient = null;
    this.isEditing = false;
    this.displayDialog = true;
  }

  editClient(client: Client): void {
    this.selectedClient = { ...client };
    this.isEditing = true;
    this.displayDialog = true;
  }

  deleteClient(client: Client): void {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer ${client.nom} ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.clientService.delete(client.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Client supprimé avec succès'
            });
            this.loadClients();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la suppression'
            });
          }
        });
      }
    });
  }

  onDialogHide(): void {
    this.loadClients();
    this.displayDialog = false;
  }

getTypeSeverity(type: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined {
  const severityMap: Record<string, 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast'> = {
    'Menage': 'info',
    'Boutique': 'success',
    'GrandeSurface': 'warning',
    'Restaurant': 'danger',
    'Institution': 'contrast'
  };
  return severityMap[type] || 'info';
}

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.loadClients();
  }
}