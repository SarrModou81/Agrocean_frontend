// src/app/features/dashboard/components/sales-chart/sales-chart.component.ts
import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { DashboardService, VentesParMois } from '../../services/dashboard.service';

@Component({
  selector: 'app-sales-chart',
  templateUrl: './sales-chart.component.html',
  styleUrls: ['./sales-chart.component.scss']
})
export class SalesChartComponent implements OnInit {
  // CORRECTION : Utiliser le type spécifique 'line' pour ChartConfiguration
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Chiffre d\'affaires',
        fill: true,
        tension: 0.5,
        borderColor: '#2c5aa0',
        backgroundColor: 'rgba(44, 90, 160, 0.1)',
        pointBackgroundColor: '#2c5aa0',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#2c5aa0'
      },
      {
        data: [],
        label: 'Nombre de commandes',
        fill: true,
        tension: 0.5,
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        pointBackgroundColor: '#28a745',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#28a745'
      }
    ]
  };

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: false
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Mois'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Montant (FCFA)'
        }
      }
    }
  };

  // CORRECTION : Définir le type comme une chaîne littérale
  public lineChartType: 'line' = 'line';
  
  loading = true;
  currentYear = new Date().getFullYear();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadSalesData();
  }

  private loadSalesData(): void {
    this.loading = true;
    
    this.dashboardService.getVentesParMois(this.currentYear).subscribe({
      next: (data: VentesParMois[]) => {
        this.updateChartData(data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des ventes:', error);
        this.loading = false;
      }
    });
  }

  private updateChartData(data: VentesParMois[]): void {
    const monthNames = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
      'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
    ];

    this.lineChartData.labels = data.map(item => monthNames[item.mois - 1]);
    this.lineChartData.datasets[0].data = data.map(item => item.chiffre_affaires);
    this.lineChartData.datasets[1].data = data.map(item => item.nombre_commandes);
  }

  onYearChange(year: number): void {
    this.currentYear = year;
    this.loadSalesData();
  }
}