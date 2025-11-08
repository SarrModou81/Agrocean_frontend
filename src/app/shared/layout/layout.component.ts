import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import { AlerteService } from '../../core/services/all-services';
import { MenuItem } from 'primeng/api';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  menuItems: MenuItem[] = [];
  sidebarVisible = true;
  alertesNonLues = 0;
  private alerteSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alerteService: AlerteService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.buildMenu();

      // Charger le nombre d'alertes non lues si l'utilisateur a accès
      if (this.canViewAlertes()) {
        this.loadAlertesCount();
        // Rafraîchir toutes les 30 secondes
        this.alerteSubscription = interval(30000)
          .pipe(switchMap(() => this.alerteService.getNonLuesCount()))
          .subscribe(response => {
            this.alertesNonLues = response.count;
          });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.alerteSubscription) {
      this.alerteSubscription.unsubscribe();
    }
  }

  loadAlertesCount(): void {
    this.alerteService.getNonLuesCount().subscribe({
      next: (response) => {
        this.alertesNonLues = response.count;
      },
      error: () => {
        this.alertesNonLues = 0;
      }
    });
  }

  buildMenu(): void {
    if (!this.currentUser) return;

    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: ['/dashboard']
      }
    ];

    // Menu pour Administrateur
    if (this.authService.isAdmin()) {
      this.menuItems.push(
        {
          label: 'Utilisateurs',
          icon: 'pi pi-users',
          routerLink: ['/utilisateurs']
        },
        {
          label: 'Rapports',
          icon: 'pi pi-chart-bar',
          items: [
            {
              label: 'Rapport Financier',
              icon: 'pi pi-dollar',
              routerLink: ['/rapports/financier']
            },
            {
              label: 'Rapport Stocks',
              icon: 'pi pi-box',
              routerLink: ['/rapports/stocks']
            },
            {
              label: 'Rapport Ventes',
              icon: 'pi pi-shopping-cart',
              routerLink: ['/rapports/ventes']
            },
            {
              label: 'Performances',
              icon: 'pi pi-chart-line',
              routerLink: ['/rapports/performances']
            }
          ]
        }
      );
    }

    // Menu pour Commercial
    if (this.authService.hasRole(['Administrateur', 'Commercial'])) {
      this.menuItems.push(
        {
          label: 'Clients',
          icon: 'pi pi-users',
          routerLink: ['/clients']
        },
        {
          label: 'Ventes',
          icon: 'pi pi-shopping-cart',
          items: [
            {
              label: 'Liste des ventes',
              icon: 'pi pi-list',
              routerLink: ['/ventes']
            },
            {
              label: 'Nouvelle vente',
              icon: 'pi pi-plus',
              routerLink: ['/ventes/create']
            },
            {
              label: 'Devis',
              icon: 'pi pi-file',
              routerLink: ['/ventes/devis']
            }
          ]
        }
      );
    }

    // Menu pour Gestionnaire Stock
    if (this.authService.hasRole(['Administrateur', 'GestionnaireStock'])) {
      this.menuItems.push(
        {
          label: 'Produits',
          icon: 'pi pi-tag',
          routerLink: ['/produits']
        },
        {
          label: 'Stocks',
          icon: 'pi pi-box',
          items: [
            {
              label: 'Vue des stocks',
              icon: 'pi pi-eye',
              routerLink: ['/stocks']
            },
            {
              label: 'Entrées/Sorties',
              icon: 'pi pi-arrow-right-arrow-left',
              routerLink: ['/stocks/mouvements']
            },
            {
              label: 'Inventaire',
              icon: 'pi pi-list-check',
              routerLink: ['/stocks/inventaire']
            },
            {
              label: 'Alertes',
              icon: 'pi pi-bell',
              routerLink: ['/stocks/alertes']
            }
          ]
        },
        {
          label: 'Entrepôts',
          icon: 'pi pi-building',
          routerLink: ['/entrepots']
        }
      );
    }

    // Menu pour Agent Approvisionnement
    if (this.authService.hasRole(['Administrateur', 'AgentApprovisionnement'])) {
      this.menuItems.push(
        {
          label: 'Fournisseurs',
          icon: 'pi pi-truck',
          routerLink: ['/fournisseurs']
        },
        {
          label: 'Commandes Achat',
          icon: 'pi pi-shopping-bag',
          items: [
            {
              label: 'Liste des commandes',
              icon: 'pi pi-list',
              routerLink: ['/commandes-achat']
            },
            {
              label: 'Nouvelle commande',
              icon: 'pi pi-plus',
              routerLink: ['/commandes-achat/create']
            },
            {
              label: 'Réceptions',
              icon: 'pi pi-inbox',
              routerLink: ['/commandes-achat/receptions']
            }
          ]
        }
      );
    }

    // Menu pour Comptable
    if (this.authService.hasRole(['Administrateur', 'Comptable'])) {
      this.menuItems.push(
        {
          label: 'Finances',
          icon: 'pi pi-dollar',
          items: [
            {
              label: 'Paiements',
              icon: 'pi pi-money-bill',
              routerLink: ['/finances/paiements']
            },
            {
              label: 'Factures',
              icon: 'pi pi-file',
              routerLink: ['/finances/factures']
            },
            {
              label: 'Créances',
              icon: 'pi pi-clock',
              routerLink: ['/finances/creances']
            },
            {
              label: 'Factures fournisseurs',
              icon: 'pi pi-file',
              routerLink: ['/finances/factures-fournisseurs']
            },
            {
              label: 'Trésorerie',
              icon: 'pi pi-wallet',
              routerLink: ['/finances/tresorerie']
            },
            {
              label: 'Bilans',
              icon: 'pi pi-chart-bar',
              routerLink: ['/finances/bilans']
            }
          ]
        }
      );
    }

    // Menu Livraisons (Commercial)
    if (this.authService.hasRole(['Administrateur', 'Commercial'])) {
      this.menuItems.push({
        label: 'Livraisons',
        icon: 'pi pi-car',
        routerLink: ['/livraisons']
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  navigateToAlertes(): void {
    this.router.navigate(['/stocks/alertes']);
  }

  // Vérifie si l'utilisateur peut voir les alertes
  canViewAlertes(): boolean {
    return this.authService.hasRole(['Administrateur', 'GestionnaireStock']);
  }

  // MÉTHODE AJOUTÉE - Affiche le rôle de manière lisible
  getRoleDisplay(): string {
    if (!this.currentUser) return '';

    const roleMap: { [key: string]: string } = {
      'Administrateur': 'Administrateur',
      'Commercial': 'Commercial',
      'GestionnaireStock': 'Gestionnaire de Stock',
      'Comptable': 'Comptable',
      'AgentApprovisionnement': 'Agent d\'Approvisionnement'
    };

    return roleMap[this.currentUser.role] || this.currentUser.role;
  }
}