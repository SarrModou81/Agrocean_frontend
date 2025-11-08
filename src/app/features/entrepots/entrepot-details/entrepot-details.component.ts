import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EntrepotService } from '../../../core/services/all-services';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-entrepot-details',
  templateUrl: './entrepot-details.component.html',
  styleUrls: ['./entrepot-details.component.scss']
})
export class EntrepotDetailsComponent implements OnInit {
  entrepot: any = null;
  loading = false;

  constructor(
    private entrepotService: EntrepotService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadEntrepot(id);
  }

  loadEntrepot(id: number): void {
    this.loading = true;
    this.entrepotService.getById(id).subscribe({
      next: (data) => {
        this.entrepot = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des détails'
        });
        this.loading = false;
        this.router.navigate(['/entrepots']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/entrepots']);
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

  getTauxRemplissage(): number {
    if (!this.entrepot) return 0;
    const utilise = this.entrepot.capacite - (this.entrepot.capacite_disponible || 0);
    return Math.round((utilise / this.entrepot.capacite) * 100);
  }
}
