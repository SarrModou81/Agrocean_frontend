import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';

// Components
import { FinancesDashboardComponent } from './finances-dashboard/finances-dashboard.component';
import { PaiementsListComponent } from './paiements-list/paiements-list.component';
import { PaiementFormComponent } from './paiement-form/paiement-form.component';
import { FacturesListComponent } from './factures-list/factures-list.component';
import { CreancesListComponent } from './creances-list/creances-list.component';
import { TresorerieComponent } from './tresorerie/tresorerie.component';
import { BilansListComponent } from './bilans-list/bilans-list.component';

const routes: Routes = [
  { path: '', component: FinancesDashboardComponent },
  { path: 'paiements', component: PaiementsListComponent },
  { path: 'factures', component: FacturesListComponent },
  { path: 'creances', component: CreancesListComponent },
  { path: 'tresorerie', component: TresorerieComponent },
  { path: 'bilans', component: BilansListComponent }
];

@NgModule({
  declarations: [
    FinancesDashboardComponent,
    PaiementsListComponent,
    PaiementFormComponent,
    FacturesListComponent,
    CreancesListComponent,
    TresorerieComponent,
    BilansListComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    TagModule,
    BadgeModule,
    TooltipModule,
    InputNumberModule,
    CalendarModule,
    ChartModule,
    ProgressBarModule
  ]
})
export class FinancesModule { }