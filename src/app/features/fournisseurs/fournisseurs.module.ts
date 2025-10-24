// src/app/features/fournisseurs/fournisseurs.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RatingModule } from 'primeng/rating';

// Components
import { FournisseursListComponent } from './fournisseurs-list/fournisseurs-list.component';
import { FournisseurFormComponent } from './fournisseur-form/fournisseur-form.component';

const routes: Routes = [
  { path: '', component: FournisseursListComponent }
];

@NgModule({
  declarations: [
    FournisseursListComponent,
    FournisseurFormComponent
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
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    TagModule,
    TooltipModule,
    InputTextareaModule,
    RatingModule
  ]
})
export class FournisseursModule { }