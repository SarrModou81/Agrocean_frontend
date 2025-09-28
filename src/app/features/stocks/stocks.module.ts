// src/app/features/stocks/stocks.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { SharedModule } from '../../shared/shared.module';

import { StocksRoutingModule } from './stocks-routing.module';
import { StocksListComponent } from './stocks-list/stocks-list.component';
import { StockDetailComponent } from './stock-detail/stock-detail.component';
import { StockAjustementDialogComponent } from './stock-ajustement-dialog/stock-ajustement-dialog.component';
import { MouvementsStockComponent } from './mouvements-stock/mouvements-stock.component';
import { AlertesStockComponent } from './alertes-stock/alertes-stock.component';

@NgModule({
  declarations: [
    StocksListComponent,
    StockDetailComponent,
    StockAjustementDialogComponent,
    MouvementsStockComponent,
    AlertesStockComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    StocksRoutingModule,
    NgChartsModule
  ]
})
export class StocksModule { }