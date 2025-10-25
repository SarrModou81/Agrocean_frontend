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
import { ProgressBarModule } from 'primeng/progressbar';
import { AvatarModule } from 'primeng/avatar';

// Components
import { VentesListComponent } from './ventes-list/ventes-list.component';
import { VenteCreateComponent } from './vente-create/vente-create.component';
import { VenteDetailsComponent } from './vente-details/vente-details.component';

const routes: Routes = [
  { path: '', component: VentesListComponent },
  { path: 'create', component: VenteCreateComponent },
  { path: ':id', component: VenteDetailsComponent }
];

@NgModule({
  declarations: [
    VentesListComponent,
    VenteCreateComponent,
    VenteDetailsComponent
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
    ProgressBarModule,
    AvatarModule
  ]
})
export class VentesModule { }