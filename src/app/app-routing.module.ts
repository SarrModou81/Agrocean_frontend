import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'utilisateurs',
        loadChildren: () => import('./features/utilisateurs/utilisateurs.module').then(m => m.UtilisateursModule),
        data: { roles: ['Administrateur'] }
      },
      {
        path: 'clients',
        loadChildren: () => import('./features/clients/clients.module').then(m => m.ClientsModule),
        data: { roles: ['Administrateur', 'Commercial'] }
      },
      {
        path: 'produits',
        loadChildren: () => import('./features/produits/produits.module').then(m => m.ProduitsModule)
      },
      {
        path: 'stocks',
        loadChildren: () => import('./features/stocks/stocks.module').then(m => m.StocksModule),
        data: { roles: ['Administrateur', 'GestionnaireStock'] }
      },
      {
        path: 'ventes',
        loadChildren: () => import('./features/ventes/ventes.module').then(m => m.VentesModule),
        data: { roles: ['Administrateur', 'Commercial'] }
      },
      {
        path: 'commandes-achat',
        loadChildren: () => import('./features/commandes-achat/commandes-achat.module').then(m => m.CommandesAchatModule),
        data: { roles: ['Administrateur', 'AgentApprovisionnement'] }
      },
      {
        path: 'fournisseurs',
        loadChildren: () => import('./features/fournisseurs/fournisseurs.module').then(m => m.FournisseursModule),
        data: { roles: ['Administrateur', 'AgentApprovisionnement'] }
      },
      {
        path: 'finances',
        loadChildren: () => import('./features/finances/finances.module').then(m => m.FinancesModule),
        data: { roles: ['Administrateur', 'Comptable'] }
      },
      {
        path: 'rapports',
        loadChildren: () => import('./features/rapports/rapports.module').then(m => m.RapportsModule),
        data: { roles: ['Administrateur'] }
      },
      {
        path: 'entrepots',
        loadChildren: () => import('./features/entrepots/entrepots.module').then(m => m.EntrepotsModule),
        data: { roles: ['Administrateur', 'GestionnaireStock'] }
      },
      {
        path: 'categories',
        loadChildren: () => import('./features/categories/categories.module').then(m => m.CategoriesModule),
        data: { roles: ['Administrateur', 'GestionnaireStock'] }
      },
      {
        path: 'livraisons',
        loadChildren: () => import('./features/livraisons/livraisons.module').then(m => m.LivraisonsModule),
        data: { roles: ['Administrateur', 'Commercial'] }
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
