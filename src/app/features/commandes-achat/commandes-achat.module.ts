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
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { InputTextareaModule } from 'primeng/inputtextarea';

// Components
import { CommandesAchatListComponent } from './commandes-achat-list/commandes-achat-list.component';
import { CommandeAchatCreateComponent } from './commande-achat-create/commande-achat-create.component';
import { CommandeAchatDetailsComponent } from './commande-achat-details/commande-achat-details.component';

const routes: Routes = [
  { path: '', component: CommandesAchatListComponent },
  { path: 'create', component: CommandeAchatCreateComponent },
  { path: ':id', component: CommandeAchatDetailsComponent }
];

@NgModule({
  declarations: [
    CommandesAchatListComponent,
    CommandeAchatCreateComponent,
    CommandeAchatDetailsComponent
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
    TooltipModule,
    CalendarModule,
    InputNumberModule,
    MessageModule,
    InputTextareaModule
  ]
})
export class CommandesAchatModule { }