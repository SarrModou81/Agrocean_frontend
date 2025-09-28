// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'produits',
    loadChildren: () => import('./features/produits/produits.module').then(m => m.ProduitsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'stocks',
    loadChildren: () => import('./features/stocks/stocks.module').then(m => m.StocksModule),
    canActivate: [AuthGuard],
    data: { roles: ['GestionnaireStock', 'ResponsableAppro', 'Directeur'] }
  },
  {
    path: 'commandes',
    loadChildren: () => import('./features/commandes/commandes.module').then(m => m.CommandesModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'clients',
    loadChildren: () => import('./features/clients/clients.module').then(m => m.ClientsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'fournisseurs',
    loadChildren: () => import('./features/fournisseurs/fournisseurs.module').then(m => m.FournisseursModule),
    canActivate: [AuthGuard],
    data: { roles: ['ResponsableAppro', 'GestionnaireStock', 'Directeur'] }
  },
  {
    path: 'factures',
    loadChildren: () => import('./features/factures/factures.module').then(m => m.FacturesModule),
    canActivate: [AuthGuard],
    data: { roles: ['Commercial', 'AdminFinance', 'Directeur'] }
  },
  {
    path: 'livraisons',
    loadChildren: () => import('./features/livraisons/livraisons.module').then(m => m.LivraisonsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'inventaires',
    loadChildren: () => import('./features/inventaires/inventaires.module').then(m => m.InventairesModule),
    canActivate: [AuthGuard],
    data: { roles: ['GestionnaireStock', 'Directeur'] }
  },
  {
    path: 'alertes',
    loadChildren: () => import('./features/alertes/alertes.module').then(m => m.AlertesModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'users',
    loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule),
    canActivate: [AuthGuard],
    data: { roles: ['Directeur'] }
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false, // Set to true for debugging
    scrollPositionRestoration: 'top'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }