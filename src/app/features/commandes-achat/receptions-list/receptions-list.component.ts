import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommandeAchatService, FournisseurService } from '../../../core/services/all-services';
import { CommandeAchat, Fournisseur } from '../../../core/models';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-receptions-list',
  templateUrl: './receptions-list.component.html',
  styleUrls: ['./receptions-list.component.scss']
})
export class ReceptionsListComponent implements OnInit {
  receptions: CommandeAchat[] = [];
  fournisseurs: Fournisseur[] = [];
  loading = false;

  totalRecords = 0;
  currentPage = 1;
  pageSize = 20;

  selectedFournisseur: number | null = null;
  dateDebut: Date | null = null;
  dateFin: Date | null = null;

  constructor(
    private commandeService: CommandeAchatService,
    private fournisseurService: FournisseurService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFournisseurs();
    this.loadReceptions();
  }

  loadFournisseurs(): void {
    this.fournisseurService.getAll().subscribe({
      next: (response) => {
        this.fournisseurs = response.data;
      }
    });
  }

  loadReceptions(): void {
    this.loading = true;
    const params: any = {
      page: this.currentPage,
      per_page: this.pageSize,
      statut: 'Reçue' // Filtrer uniquement les commandes reçues
    };

    if (this.selectedFournisseur) {
      params.fournisseur_id = this.selectedFournisseur;
    }

    if (this.dateDebut) {
      params.date_debut = this.formatDate(this.dateDebut);
    }

    if (this.dateFin) {
      params.date_fin = this.formatDate(this.dateFin);
    }

    this.commandeService.getAll(params).subscribe({
      next: (response) => {
        this.receptions = response.data;
        this.totalRecords = response.total;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des réceptions'
        });
        this.loading = false;
      }
    });
  }

  voirDetails(reception: CommandeAchat): void {
    this.router.navigate(['/commandes-achat', reception.id]);
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadReceptions();
  }

  clearFilters(): void {
    this.selectedFournisseur = null;
    this.dateDebut = null;
    this.dateFin = null;
    this.applyFilters();
  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.loadReceptions();
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatCurrency(value: any): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0 FCFA';
    return numValue.toLocaleString('fr-FR') + ' FCFA';
  }

  getStatutSeverity(statut: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined {
    const severityMap: Record<string, 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast'> = {
      'Brouillon': 'secondary',
      'Validée': 'warning',
      'EnCours': 'info',
      'Reçue': 'success',
      'Annulée': 'danger'
    };
    return severityMap[statut] || 'secondary';
  }
}
