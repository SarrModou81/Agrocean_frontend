// src/app/features/commandes/commandes-list/commandes-list.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { CommandesService, CommandeFilters } from '../services/commandes.service';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Commande } from '../../../core/models/commande.model';
import { Client } from '../../../core/models/client.model';
import { User } from '../../../core/models/user.model';
import { CommandeFormComponent } from '../commande-form/commande-form.component';
import { CommandeStatusDialogComponent } from '../commande-status-dialog/commande-status-dialog.component';

@Component({
  selector: 'app-commandes-list',
  templateUrl: './commandes-list.component.html',
  styleUrls: ['./commandes-list.component.scss']
})
export class CommandesListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<Commande>();
  displayedColumns: string[] = [
    'numero_commande',
    'client',
    'date_commande',
    'date_livraison_prevue',
    'montant_total',
    'statut_commande',
    'actions'
  ];

  loading = true;
  totalItems = 0;
  pageSize = 15;
  currentPage = 0;

  // Filtres
  statutControl = new FormControl('');
  clientControl = new FormControl('');
  dateDebutControl = new FormControl('');
  dateFinControl = new FormControl('');

  clients: Client[] = [];
  commerciaux: User[] = [];

  statuts = [
    { value: 'En_attente', label: 'En attente', color: 'warning' },
    { value: 'Confirmee', label: 'Confirmée', color: 'info' },
    { value: 'En_preparation', label: 'En préparation', color: 'primary' },
    { value: 'Livree', label: 'Livrée', color: 'success' },
    { value: 'Annulee', label: 'Annulée', color: 'danger' }
  ];

  constructor(
    private commandesService: CommandesService,
    private apiService: ApiService,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCommandes();
    this.loadClients();
    this.setupFilters();
  }

  private setupFilters(): void {
    this.statutControl.valueChanges.subscribe(() => {
      this.currentPage = 0;
      this.loadCommandes();
    });

    this.clientControl.valueChanges.subscribe(() => {
      this.currentPage = 0;
      this.loadCommandes();
    });

    this.dateDebutControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadCommandes();
    });

    this.dateFinControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadCommandes();
    });
  }

  private getFilters(): CommandeFilters {
    const filters: CommandeFilters = {};
    
    if (this.statutControl.value) {
      filters.statut_commande = this.statutControl.value;
    }
    
    if (this.clientControl.value) {
      filters.client_id = Number(this.clientControl.value);
    }
    
    if (this.dateDebutControl.value) {
      filters.date_debut = this.dateDebutControl.value;
    }
    
    if (this.dateFinControl.value) {
      filters.date_fin = this.dateFinControl.value;
    }
    
    return filters;
  }

  loadCommandes(): void {
    this.loading = true;
    const filters = this.getFilters();

    this.commandesService.getCommandes(this.currentPage + 1, this.pageSize, filters).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.totalItems = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes:', error);
        this.loading = false;
      }
    });
  }

  private loadClients(): void {
    this.apiService.get<Client[]>('clients').subscribe({
      next: (clients) => {
        this.clients = clients;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des clients:', error);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCommandes();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CommandeFormComponent, {
      width: '800px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCommandes();
        this.notificationService.success('Commande créée avec succès');
      }
    });
  }

  openStatusDialog(commande: Commande, action: 'confirmer' | 'annuler'): void {
    const dialogRef = this.dialog.open(CommandeStatusDialogComponent, {
      width: '400px',
      data: { commande, action }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCommandes();
        const message = action === 'confirmer' ? 'Commande confirmée' : 'Commande annulée';
        this.notificationService.success(message);
      }
    });
  }

  clearFilters(): void {
    this.statutControl.setValue('');
    this.clientControl.setValue('');
    this.dateDebutControl.setValue('');
    this.dateFinControl.setValue('');
  }

  getStatutInfo(statut: string): any {
    return this.statuts.find(s => s.value === statut) || 
           { label: statut, color: 'secondary' };
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  }

  canConfirm(commande: Commande): boolean {
    return commande.statut_commande === 'En_attente';
  }

  canCancel(commande: Commande): boolean {
    return ['En_attente', 'Confirmee'].includes(commande.statut_commande);
  }
}
