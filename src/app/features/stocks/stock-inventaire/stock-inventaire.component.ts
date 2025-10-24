// src/app/features/stocks/stock-inventaire/stock-inventaire.component.ts
import { Component, OnInit } from '@angular/core';
import { StockService, EntrepotService } from '../../../core/services/all-services';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-stock-inventaire',
  templateUrl: './stock-inventaire.component.html',
  styleUrls: ['./stock-inventaire.component.scss']
})
export class StockInventaireComponent implements OnInit {
  inventaire: any = null;
  loading = false;
  selectedEntrepot: number | null = null;
  entrepots: any[] = [];

  constructor(
    private stockService: StockService,
    private entrepotService: EntrepotService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadEntrepots();
    this.genererInventaire();
  }

  loadEntrepots(): void {
    this.entrepotService.getAll().subscribe({
      next: (data) => {
        this.entrepots = data;
      }
    });
  }

  genererInventaire(): void {
    this.loading = true;
    const params: any = {};
    
    if (this.selectedEntrepot) {
      params.entrepot_id = this.selectedEntrepot;
    }

    this.stockService.inventaire(params).subscribe({
      next: (data) => {
        this.inventaire = data;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la génération de l\'inventaire'
        });
        this.loading = false;
      }
    });
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }

  exportPDF(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Export PDF en cours de développement'
    });
  }

  exportExcel(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Export Excel en cours de développement'
    });
  }
}