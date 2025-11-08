import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EntrepotService } from '../../../core/services/all-services';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-entrepots-list',
  templateUrl: './entrepots-list.component.html',
  styleUrls: ['./entrepots-list.component.scss']
})
export class EntrepotsListComponent implements OnInit {
  entrepots: any[] = [];
  loading = false;
  displayDialog = false;
  selectedEntrepot: any = null;

  constructor(
    private entrepotService: EntrepotService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEntrepots();
  }

  loadEntrepots(): void {
    this.loading = true;
    this.entrepotService.getAll().subscribe({
      next: (data) => {
        this.entrepots = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des entrepôts'
        });
        this.loading = false;
      }
    });
  }

  openNew(): void {
    this.selectedEntrepot = {
      nom: '',
      adresse: '',
      capacite: null,
      type_froid: 'Ambiant'
    };
    this.displayDialog = true;
  }

  editEntrepot(entrepot: any): void {
    this.selectedEntrepot = { ...entrepot };
    this.displayDialog = true;
  }

  viewDetails(entrepot: any): void {
    this.router.navigate(['/entrepots', entrepot.id]);
  }

  saveEntrepot(): void {
    if (this.selectedEntrepot.id) {
      this.entrepotService.update(this.selectedEntrepot.id, this.selectedEntrepot).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Entrepôt mis à jour avec succès'
          });
          this.displayDialog = false;
          this.loadEntrepots();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors de la mise à jour'
          });
        }
      });
    } else {
      this.entrepotService.create(this.selectedEntrepot).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Entrepôt créé avec succès'
          });
          this.displayDialog = false;
          this.loadEntrepots();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors de la création'
          });
        }
      });
    }
  }

  getTypeFroidSeverity(type: string): 'success' | 'info' | 'warning' | 'danger' {
    const severityMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
      'Frais': 'info',
      'Congelé': 'primary' as any,
      'Ambiant': 'success',
      'Mixte': 'warning'
    };
    return severityMap[type] || 'info';
  }
}
