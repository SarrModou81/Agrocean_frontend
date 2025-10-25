import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';

// Components
import { RapportFinancierComponent } from './rapport-financier/rapport-financier.component';
import { RapportStocksComponent } from './rapport-stocks/rapport-stocks.component';
import { RapportVentesComponent } from './rapport-ventes/rapport-ventes.component';
import { RapportPerformancesComponent } from './rapport-performances/rapport-performances.component';

const routes: Routes = [
  { path: 'financier', component: RapportFinancierComponent },
  { path: 'stocks', component: RapportStocksComponent },
  { path: 'ventes', component: RapportVentesComponent },
  { path: 'performances', component: RapportPerformancesComponent },
  { path: '', redirectTo: 'financier', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    RapportFinancierComponent,
    RapportStocksComponent,
    RapportVentesComponent,
    RapportPerformancesComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    CalendarModule,
    ChartModule,
    TableModule,
    ProgressBarModule,
    TagModule,
    ToastModule
  ]
})
export class RapportsModule { }