// src/app/features/clients/clients-list/clients-list.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ClientsService, ClientFilters } from '../services/clients.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Client } from '../../../core/models/client.model';
import { ClientFormComponent } from '../client-form/client-form.component';
import { ClientDeleteDialogComponent } from '../client-delete-dialog/client-delete-dialog.component';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss']
})
export class ClientsListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<Client>();
  displayedColumns: string[] = [
    'nom',
    'type_client',
    'telephone',
    'email',
    'adresse',
    'date_creation',
    'actions'
  ];

  loading = true;
  totalItems = 0;
  pageSize = 15;
  currentPage = 0;

  // Filtres
  searchControl = new FormControl('');
  typeControl = new FormControl('');

  typesClient = [
    { value: 'Menage', label: 'Ménage', icon: 'home' },
    { value: 'Restaurant', label: 'Restaurant', icon: 'restaurant' },
    { value: 'Boutique', label: 'Boutique', icon: 'store' },
    { value: 'GrandeSurface', label: 'Grande Surface', icon: 'shopping_cart' },
    { value: 'Institution', label: 'Institution', icon: 'business' }
  ];

  constructor(
    private clientsService: ClientsService,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.setupFilters();
  }

  private setupFilters(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadClients();
    });

    this.typeControl.valueChanges.subscribe(() => {
      this.currentPage = 0;
      this.loadClients();
    });
  }

  private getFilters(): ClientFilters {
    const filters: ClientFilters = {};
    
    if (this.searchControl.value?.trim()) {
      filters.search = this.searchControl.value.trim();
    }
    
    if (this.typeControl.value) {
      filters.type_client = this.typeControl.value;
    }
    
    return filters;
  }

  loadClients(): void {
    this.loading = true;
    const filters = this.getFilters();

    this.clientsService.getClients(this.currentPage + 1, this.pageSize, filters).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.totalItems = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des clients:', error);
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadClients();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ClientFormComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadClients();
        this.notificationService.success('Client créé avec succès');
      }
    });
  }

  openEditDialog(client: Client): void {
    const dialogRef = this.dialog.open(ClientFormComponent, {
      width: '600px',
      data: { mode: 'edit', client }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadClients();
        this.notificationService.success('Client modifié avec succès');
      }
    });
  }

  openDeleteDialog(client: Client): void {
    const dialogRef = this.dialog.open(ClientDeleteDialogComponent, {
      width: '400px',
      data: client
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadClients();
        this.notificationService.success('Client supprimé avec succès');
      }
    });
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.typeControl.setValue('');
  }

  getTypeInfo(type: string): any {
    return this.typesClient.find(t => t.value === type) || 
           { label: type, icon: 'person' };
  }
}
