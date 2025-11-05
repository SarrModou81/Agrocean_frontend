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
import { MessageModule } from 'primeng/message';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ProgressBarModule } from 'primeng/progressbar';
import { CheckboxModule } from 'primeng/checkbox';

// Components
import { StocksListComponent } from './stocks-list/stocks-list.component';
import { StockFormComponent } from './stock-form/stock-form.component';
import { StockAjustementComponent } from './stock-ajustement/stock-ajustement.component';
import { StockInventaireComponent } from './stock-inventaire/stock-inventaire.component';
import { StockMouvementsComponent } from './stock-mouvements/stock-mouvements.component';
import { StockAlertesComponent } from './stock-alertes/stock-alertes.component';

const routes: Routes = [
  { path: '', component: StocksListComponent },
  { path: 'inventaire', component: StockInventaireComponent },
  { path: 'mouvements', component: StockMouvementsComponent },
  { path: 'alertes', component: StockAlertesComponent }
];

@NgModule({
  declarations: [
    StocksListComponent,
    StockFormComponent,
    StockAjustementComponent,
    StockInventaireComponent,
    StockMouvementsComponent,
    StockAlertesComponent
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
    MessageModule,
    InputTextareaModule,
    ProgressBarModule,
    CheckboxModule
  ]
})
export class StocksModule { }