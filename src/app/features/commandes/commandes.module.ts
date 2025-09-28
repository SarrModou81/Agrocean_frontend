// src/app/features/commandes/commandes.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

import { CommandesRoutingModule } from './commandes-routing.module';
import { CommandesListComponent } from './commandes-list/commandes-list.component';
import { CommandeDetailComponent } from './commande-detail/commande-detail.component';
import { CommandeFormComponent } from './commande-form/commande-form.component';
import { CommandeStatusDialogComponent } from './commande-status-dialog/commande-status-dialog.component';
import { LigneCommandeFormComponent } from './ligne-commande-form/ligne-commande-form.component';

@NgModule({
  declarations: [
    CommandesListComponent,
    CommandeDetailComponent,
    CommandeFormComponent,
    CommandeStatusDialogComponent,
    LigneCommandeFormComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CommandesRoutingModule
  ]
})
export class CommandesModule { }