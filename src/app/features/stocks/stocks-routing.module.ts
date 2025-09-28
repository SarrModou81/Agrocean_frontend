// src/app/features/stocks/stocks-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StocksListComponent } from './stocks-list/stocks-list.component';
import { StockDetailComponent } from './stock-detail/stock-detail.component';
import { MouvementsStockComponent } from './mouvements-stock/mouvements-stock.component';
import { AlertesStockComponent } from './alertes-stock/alertes-stock.component';

const routes: Routes = [
  { path: '', component: StocksListComponent },
  { path: 'detail/:id', component: StockDetailComponent },
  { path: 'mouvements', component: MouvementsStockComponent },
  { path: 'alertes', component: AlertesStockComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StocksRoutingModule { }