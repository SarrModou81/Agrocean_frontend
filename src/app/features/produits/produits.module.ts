// src/app/features/produits/produits.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

import { ProduitsRoutingModule } from './produits-routing.module';
import { ProduitsListComponent } from './produits-list/produits-list.component';
import { ProduitDetailComponent } from './produit-detail/produit-detail.component';
import { ProduitFormComponent } from './produit-form/produit-form.component';
import { ProduitDeleteDialogComponent } from './produit-delete-dialog/produit-delete-dialog.component';

@NgModule({
  declarations: [
    ProduitsListComponent,
    ProduitDetailComponent,
    ProduitFormComponent,
    ProduitDeleteDialogComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ProduitsRoutingModule
  ]
})
export class ProduitsModule { }