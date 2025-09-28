// src/app/features/clients/clients.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

import { ClientsRoutingModule } from './clients-routing.module';
import { ClientsListComponent } from './clients-list/clients-list.component';
import { ClientDetailComponent } from './client-detail/client-detail.component';
import { ClientFormComponent } from './client-form/client-form.component';
import { ClientDeleteDialogComponent } from './client-delete-dialog/client-delete-dialog.component';
import { ClientStatsComponent } from './client-stats/client-stats.component';

@NgModule({
  declarations: [
    ClientsListComponent,
    ClientDetailComponent,
    ClientFormComponent,
    ClientDeleteDialogComponent,
    ClientStatsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ClientsRoutingModule
  ]
})
export class ClientsModule { }