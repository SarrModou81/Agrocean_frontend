// src/app/features/dashboard/dashboard.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';

import { SharedModule } from '../../shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { StatsCardsComponent } from './components/stats-cards/stats-cards.component';
import { SalesChartComponent } from './components/sales-chart/sales-chart.component';
import { TopProductsComponent } from './components/top-products/top-products.component';
import { AlertsListComponent } from './components/alerts-list/alerts-list.component';
import { RecentOrdersComponent } from './recent-orders/recent-orders.component';

@NgModule({
  declarations: [
    DashboardComponent,
    StatsCardsComponent,
    SalesChartComponent,
    TopProductsComponent,
    AlertsListComponent,
    RecentOrdersComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DashboardRoutingModule,
    NgChartsModule
  ]
})
export class DashboardModule { }

