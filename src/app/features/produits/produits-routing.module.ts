// src/app/features/produits/produits-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProduitsListComponent } from './produits-list/produits-list.component';
import { ProduitDetailComponent } from './produit-detail/produit-detail.component';

const routes: Routes = [
  { path: '', component: ProduitsListComponent },
  { path: 'detail/:id', component: ProduitDetailComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProduitsRoutingModule { }