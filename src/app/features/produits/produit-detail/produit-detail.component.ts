// src/app/features/produits/produit-detail/produit-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProduitsService } from '../services/produits.service';
import { Produit } from '../../../core/models/produit.model';
import { MatDialog } from '@angular/material/dialog';
import { ProduitFormComponent } from '../produit-form/produit-form.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-produit-detail',
  templateUrl: './produit-detail.component.html',
  styleUrls: ['./produit-detail.component.scss']
})
export class ProduitDetailComponent implements OnInit {
  produit: Produit | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produitsService: ProduitsService,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadProduit(id);
    } else {
      this.router.navigate(['/produits']);
    }
  }

  private loadProduit(id: number): void {
    this.loading = true;
    
    this.produitsService.getProduit(id).subscribe({
      next: (produit) => {
        this.produit = produit;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du produit:', error);
        this.notificationService.error('Produit non trouvé');
        this.router.navigate(['/produits']);
      }
    });
  }

  openEditDialog(): void {
    if (!this.produit) return;

    const dialogRef = this.dialog.open(ProduitFormComponent, {
      width: '600px',
      data: { mode: 'edit', produit: this.produit }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProduit(this.produit!.id);
        this.notificationService.success('Produit modifié avec succès');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/produits']);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getCategoryLabel(category: string): string {
    const categories: { [key: string]: string } = {
      'Fruit': 'Fruits',
      'Legume': 'Légumes',
      'Poisson': 'Poissons',
      'Crustace': 'Crustacés',
      'Halieutique': 'Halieutiques'
    };
    return categories[category] || category;
  }

  getUniteLabel(unite: string): string {
    const unites: { [key: string]: string } = {
      'kg': 'Kilogramme',
      'paquet': 'Paquet',
      'piece': 'Pièce'
    };
    return unites[unite] || unite;
  }
}
