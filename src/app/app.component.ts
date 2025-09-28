// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { LoadingService } from './core/services/loading.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'agrocean-frontend';
  isAuthenticated = false;
  isAuthRoute = false;
  sidebarCollapsed = false;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    // Surveiller l'état d'authentification
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });

    // Surveiller les changements de route - CORRECTION ICI
    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isAuthRoute = event.url.includes('/auth');
    });

    // Surveiller l'état de chargement
    this.loadingService.loading$.subscribe(loading => {
      this.loading = loading;
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}