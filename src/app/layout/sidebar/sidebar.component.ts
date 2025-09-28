// src/app/layout/sidebar/sidebar.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  currentUser: User | null = null;
  expandedItems: Set<string> = new Set();

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      route: '/dashboard'
    },
    {
      label: 'Produits & Stock',
      icon: 'fas fa-boxes',
      children: [
        { label: 'Produits', icon: 'fas fa-box', route: '/produits' },
        { label: 'Stocks', icon: 'fas fa-warehouse', route: '/stocks' },
        { label: 'Lots', icon: 'fas fa-tags', route: '/lots' },
        { label: 'Inventaires', icon: 'fas fa-clipboard-check', route: '/inventaires', roles: ['GestionnaireStock', 'Directeur'] }
      ]
    },
    {
      label: 'Ventes',
      icon: 'fas fa-shopping-cart',
      children: [
        { label: 'Commandes', icon: 'fas fa-shopping-bag', route: '/commandes' },
        { label: 'Factures', icon: 'fas fa-file-invoice', route: '/factures', roles: ['Commercial', 'AdminFinance', 'Directeur'] },
        { label: 'Livraisons', icon: 'fas fa-truck', route: '/livraisons' }
      ]
    },
    {
      label: 'Contacts',
      icon: 'fas fa-address-book',
      children: [
        { label: 'Clients', icon: 'fas fa-users', route: '/clients' },
        { label: 'Fournisseurs', icon: 'fas fa-industry', route: '/fournisseurs', roles: ['ResponsableAppro', 'GestionnaireStock', 'Directeur'] }
      ]
    },
    {
      label: 'Alertes',
      icon: 'fas fa-bell',
      route: '/alertes'
    },
    {
      label: 'Administration',
      icon: 'fas fa-cogs',
      children: [
        { label: 'Utilisateurs', icon: 'fas fa-user-cog', route: '/users', roles: ['Directeur'] }
      ],
      roles: ['Directeur']
    }
  ];

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleExpanded(item: string): void {
    if (this.expandedItems.has(item)) {
      this.expandedItems.delete(item);
    } else {
      this.expandedItems.add(item);
    }
  }

  isExpanded(item: string): boolean {
    return this.expandedItems.has(item);
  }

  hasAccess(roles?: string[]): boolean {
    if (!roles || roles.length === 0) return true;
    return this.authService.hasAnyRole(roles);
  }
}