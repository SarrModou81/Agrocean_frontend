// src/app/features/commandes/commandes-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommandesListComponent } from './commandes-list/commandes-list.component';
import { CommandeDetailComponent } from './commande-detail/commande-detail.component';

const routes: Routes = [
  { path: '', component: CommandesListComponent },
  { path: 'detail/:id', component: CommandeDetailComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommandesRoutingModule { }
