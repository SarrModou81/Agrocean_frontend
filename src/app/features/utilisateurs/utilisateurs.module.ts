// src/app/features/utilisateurs/utilisateurs.module.ts
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
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';

// Components
import { UtilisateursListComponent } from './utilisateurs-list/utilisateurs-list.component';
import { UtilisateurFormComponent } from './utilisateur-form/utilisateur-form.component';

const routes: Routes = [
  { path: '', component: UtilisateursListComponent }
];

@NgModule({
  declarations: [
    UtilisateursListComponent,
    UtilisateurFormComponent
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
    CheckboxModule,
    PasswordModule
  ]
})
export class UtilisateursModule { }