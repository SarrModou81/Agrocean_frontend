// src/app/features/finances/finances.module.ts
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
import { AvatarModule } from 'primeng/avatar';
import { SelectButtonModule } from 'primeng/selectbutton';  // AJOUTÉ

// Services
import { MessageService, ConfirmationService } from 'primeng/api';

// Components
import { PaiementsListComponent } from './paiements-list/paiements-list.component';
import { PaiementFormComponent } from './paiement-form/paiement-form.component';
import { FacturesListComponent } from './factures-list/factures-list.component';
import { FacturesFournisseursListComponent } from './factures-fournisseurs-list/factures-fournisseurs-list.component';
import { CreancesListComponent } from './creances-list/creances-list.component';
import { TresorerieComponent } from './tresorerie/tresorerie.component';

const routes: Routes = [
  { path: '', redirectTo: 'factures', pathMatch: 'full' },
  { path: 'paiements', component: PaiementsListComponent },
  { path: 'factures', component: FacturesListComponent },
  { path: 'factures-fournisseurs', component: FacturesFournisseursListComponent },
  { path: 'creances', component: CreancesListComponent },
  { path: 'tresorerie', component: TresorerieComponent }
];

@NgModule({
  declarations: [
    PaiementsListComponent,
    PaiementFormComponent,
    FacturesListComponent,
    FacturesFournisseursListComponent,
    CreancesListComponent,
    TresorerieComponent
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
    ProgressBarModule,
    AvatarModule,
    SelectButtonModule  // AJOUTÉ
  ],
  providers: [
    MessageService,
    ConfirmationService
  ]
})
export class FinancesModule { }