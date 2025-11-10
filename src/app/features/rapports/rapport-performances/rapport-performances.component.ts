import { Component, OnInit } from '@angular/core';
import { RapportService } from '../../../core/services/all-services';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-rapport-performances',
  templateUrl: './rapport-performances.component.html',
  styleUrls: ['./rapport-performances.component.scss']
})
export class RapportPerformancesComponent implements OnInit {
  rapport: any = null;
  loading = false;
  dateDebut: Date | null = null;
  dateFin: Date | null = null;

  constructor(
    private rapportService: RapportService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Charger le rapport de l'année en cours par défaut
    const now = new Date();
    this.dateDebut = new Date(now.getFullYear(), 0, 1);
    this.dateFin = now;
    this.generer();
  }

  generer(): void {
    this.loading = true;
    const params: any = {};
    if (this.dateDebut) params.date_debut = this.formatDate(this.dateDebut);
    if (this.dateFin) params.date_fin = this.formatDate(this.dateFin);

    this.rapportService.analysePerformances(params).subscribe({
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

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatCurrency(value: any): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0 FCFA';
    return numValue.toLocaleString('fr-FR') + ' FCFA';
  }

  formatDateRange(): string {
    if (!this.dateDebut || !this.dateFin) return '';
    const debut = this.dateDebut.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    const fin = this.dateFin.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${debut} - ${fin}`;
  }

  getPerformancePercentage(commercial: any, allCommerciaux: any[]): number {
    if (!allCommerciaux || allCommerciaux.length === 0) return 0;
    const maxCA = Math.max(...allCommerciaux.map((c: any) => c.chiffre_affaires || 0));
    if (maxCA === 0) return 0;
    return (commercial.chiffre_affaires / maxCA) * 100;
  }
}
