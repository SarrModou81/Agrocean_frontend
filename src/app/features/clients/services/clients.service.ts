// src/app/features/clients/services/clients.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Client } from '../../../core/models/client.model';
import { PaginatedResponse } from '../../../core/models/api-response.model';

export interface ClientFilters {
  search?: string;
  type_client?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  constructor(private apiService: ApiService) {}

  getClients(page: number = 1, perPage: number = 15, filters?: ClientFilters): Observable<PaginatedResponse<Client>> {
    return this.apiService.getPaginated<Client>('clients', page, perPage, filters);
  }

  getClient(id: number): Observable<Client> {
    return this.apiService.get<Client>(`clients/${id}`);
  }

  createClient(client: Partial<Client>): Observable<Client> {
    return this.apiService.post<Client>('clients', client);
  }

  updateClient(id: number, client: Partial<Client>): Observable<Client> {
    return this.apiService.put<Client>(`clients/${id}`, client);
  }

  deleteClient(id: number): Observable<any> {
    return this.apiService.delete(`clients/${id}`);
  }

  getClientStatistics(id: number): Observable<any> {
    return this.apiService.get<any>(`clients/${id}/statistics`);
  }
}