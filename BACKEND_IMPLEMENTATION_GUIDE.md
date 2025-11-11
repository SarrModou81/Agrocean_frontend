# Guide d'Implémentation Backend - Commandes d'Achat

Ce guide détaille les modifications à apporter au backend Laravel pour supporter les nouvelles fonctionnalités de gestion des commandes d'achat.

## 📋 Nouvelles Fonctionnalités

### ✅ 1. Gestion des dates de péremption lors de la réception
- Capture de la date de péremption pour chaque produit
- Création de stocks avec dates de péremption
- Gestion des lots distincts par date de péremption

### ✅ 2. Annulation de commandes
- Annuler une commande avec motif
- Restriction : impossible d'annuler une commande déjà réceptionnée
- Traçabilité de l'annulation (qui, quand, pourquoi)

### ✅ 3. Mise à jour de commandes en brouillon
- Modifier les informations d'une commande non validée
- Mettre à jour les produits et quantités

### ✅ 4. Suppression de commandes en brouillon
- Supprimer une commande non validée

---

## 🗄️ 1. Migrations de Base de Données

### Migration pour ajouter les champs d'annulation

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('commande_achats', function (Blueprint $table) {
            $table->text('motif_annulation')->nullable();
            $table->timestamp('date_annulation')->nullable();
            $table->unsignedBigInteger('annule_par')->nullable();
            $table->timestamp('date_reception')->nullable();

            $table->foreign('annule_par')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('commande_achats', function (Blueprint $table) {
            $table->dropForeign(['annule_par']);
            $table->dropColumn([
                'motif_annulation',
                'date_annulation',
                'annule_par',
                'date_reception'
            ]);
        });
    }
};
```

### Vérifier que la table `stocks` a les champs nécessaires

```php
// La table stocks doit avoir ces colonnes :
- date_peremption (date, nullable)
- numero_lot (string, nullable)
- prix_unitaire_achat (decimal, nullable)
```

### Vérifier que la table `mouvement_stocks` existe

```php
Schema::create('mouvement_stocks', function (Blueprint $table) {
    $table->id();
    $table->foreignId('produit_id')->constrained('produits')->onDelete('cascade');
    $table->foreignId('entrepot_id')->constrained('entrepots')->onDelete('cascade');
    $table->enum('type_mouvement', ['Entrée', 'Sortie', 'Ajustement', 'Transfert']);
    $table->integer('quantite');
    $table->timestamp('date_mouvement');
    $table->foreignId('user_id')->constrained('users');
    $table->text('reference')->nullable();
    $table->foreignId('commande_achat_id')->nullable()->constrained('commande_achats');
    $table->foreignId('commande_vente_id')->nullable()->constrained('commande_ventes');
    $table->timestamps();
});
```

---

## 🛣️ 2. Routes Laravel à Ajouter

Fichier : `routes/api.php`

```php
// Routes pour les commandes d'achat
Route::middleware(['auth:sanctum'])->group(function () {

    // Routes existantes
    Route::get('/commandes-achat', [CommandeAchatController::class, 'index']);
    Route::post('/commandes-achat', [CommandeAchatController::class, 'store']);
    Route::get('/commandes-achat/{id}', [CommandeAchatController::class, 'show']);
    Route::post('/commandes-achat/{id}/valider', [CommandeAchatController::class, 'valider']);
    Route::post('/commandes-achat/{id}/receptionner', [CommandeAchatController::class, 'receptionner']);

    // 🆕 NOUVELLES ROUTES
    Route::post('/commandes-achat/{id}/annuler', [CommandeAchatController::class, 'annuler']);
    Route::put('/commandes-achat/{id}', [CommandeAchatController::class, 'update']);
    Route::delete('/commandes-achat/{id}', [CommandeAchatController::class, 'destroy']);
});
```

---

## 📝 3. Modèle CommandeAchat à Mettre à Jour

Fichier : `app/Models/CommandeAchat.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommandeAchat extends Model
{
    protected $table = 'commande_achats';

    protected $fillable = [
        'numero',
        'fournisseur_id',
        'user_id',
        'date_commande',
        'date_livraison_prevue',
        'statut',
        'montant_total',
        'motif_annulation',
        'date_annulation',
        'annule_par',
        'date_reception'
    ];

    protected $casts = [
        'date_commande' => 'date',
        'date_livraison_prevue' => 'date',
        'date_annulation' => 'datetime',
        'date_reception' => 'datetime',
        'montant_total' => 'decimal:2'
    ];

    // Relations
    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function annulePar()
    {
        return $this->belongsTo(User::class, 'annule_par');
    }

    public function detailCommandeAchats()
    {
        return $this->hasMany(DetailCommandeAchat::class);
    }

    public function mouvementStocks()
    {
        return $this->hasMany(MouvementStock::class);
    }

    // Méthodes
    public function calculerTotal()
    {
        $total = $this->detailCommandeAchats->sum(function ($detail) {
            return $detail->quantite * $detail->prix_unitaire;
        });

        $this->montant_total = $total;
        $this->save();

        return $this;
    }

    public function valider()
    {
        $this->statut = 'Validée';
        $this->save();

        return $this;
    }
}
```

---

## 📝 4. Modèle Stock à Vérifier

Fichier : `app/Models/Stock.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    protected $table = 'stocks';

    protected $fillable = [
        'produit_id',
        'entrepot_id',
        'quantite_actuelle',
        'quantite_disponible',
        'quantite_reservee',
        'seuil_alerte',
        'date_peremption',
        'numero_lot',
        'prix_unitaire_achat'
    ];

    protected $casts = [
        'date_peremption' => 'date',
        'quantite_actuelle' => 'integer',
        'quantite_disponible' => 'integer',
        'quantite_reservee' => 'integer',
        'seuil_alerte' => 'integer',
        'prix_unitaire_achat' => 'decimal:2'
    ];

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }

    public function entrepot()
    {
        return $this->belongsTo(Entrepot::class);
    }
}
```

---

## 📝 5. Modèle MouvementStock à Vérifier

Fichier : `app/Models/MouvementStock.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MouvementStock extends Model
{
    protected $table = 'mouvement_stocks';

    protected $fillable = [
        'produit_id',
        'entrepot_id',
        'type_mouvement',
        'quantite',
        'date_mouvement',
        'user_id',
        'reference',
        'commande_achat_id',
        'commande_vente_id'
    ];

    protected $casts = [
        'date_mouvement' => 'datetime',
        'quantite' => 'integer'
    ];

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }

    public function entrepot()
    {
        return $this->belongsTo(Entrepot::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function commandeAchat()
    {
        return $this->belongsTo(CommandeAchat::class);
    }

    public function commandeVente()
    {
        return $this->belongsTo(CommandeVente::class);
    }
}
```

---

## 🚀 6. Installation et Tests

### Étape 1 : Copier le contrôleur
```bash
# Remplacer le fichier existant
cp CommandeAchatController_AMELIORE.php app/Http/Controllers/CommandeAchatController.php
```

### Étape 2 : Créer et exécuter les migrations
```bash
# Créer la migration
php artisan make:migration add_annulation_fields_to_commande_achats_table

# Copier le code de migration fourni ci-dessus

# Exécuter la migration
php artisan migrate
```

### Étape 3 : Mettre à jour les modèles
```bash
# Mettre à jour les fichiers :
# - app/Models/CommandeAchat.php
# - app/Models/Stock.php
# - app/Models/MouvementStock.php
```

### Étape 4 : Ajouter les routes
```bash
# Éditer routes/api.php et ajouter les nouvelles routes
```

### Étape 5 : Tester avec Postman ou le frontend

#### Test 1 : Réception avec dates de péremption
```json
POST /api/commandes-achat/{id}/receptionner
{
  "entrepot_id": 1,
  "produits": [
    {
      "detail_commande_achat_id": 5,
      "date_peremption": "2025-12-31"
    },
    {
      "detail_commande_achat_id": 6,
      "date_peremption": null
    }
  ]
}
```

#### Test 2 : Annulation de commande
```json
POST /api/commandes-achat/{id}/annuler
{
  "motif": "Fournisseur indisponible"
}
```

#### Test 3 : Mise à jour d'une commande en brouillon
```json
PUT /api/commandes-achat/{id}
{
  "fournisseur_id": 2,
  "date_commande": "2025-11-15",
  "date_livraison_prevue": "2025-11-25",
  "produits": [
    {
      "produit_id": 1,
      "quantite": 50,
      "prix_unitaire": 1500
    }
  ]
}
```

#### Test 4 : Suppression d'une commande en brouillon
```json
DELETE /api/commandes-achat/{id}
```

---

## 📊 7. Vérifications Importantes

### ✅ Checklist Backend
- [ ] Migration exécutée avec succès
- [ ] Modèles mis à jour avec les nouveaux champs
- [ ] Routes ajoutées dans `api.php`
- [ ] Contrôleur copié et fonctionnel
- [ ] Test de réception avec dates de péremption
- [ ] Test d'annulation de commande
- [ ] Test de mise à jour de commande en brouillon
- [ ] Test de suppression de commande en brouillon
- [ ] Vérification que les stocks sont créés correctement
- [ ] Vérification que les mouvements de stock sont enregistrés

### ✅ Checklist Frontend (déjà fait)
- [x] Service Angular mis à jour
- [x] Composant de détails mis à jour
- [x] Bouton d'annulation ajouté
- [x] Dialog de réception avec dates de péremption

---

## 🔒 8. Sécurité et Permissions

### Middleware recommandé
```php
// Dans routes/api.php, ajouter des permissions si nécessaire
Route::post('/commandes-achat/{id}/annuler', [CommandeAchatController::class, 'annuler'])
    ->middleware(['can:annuler-commande']);

Route::delete('/commandes-achat/{id}', [CommandeAchatController::class, 'destroy'])
    ->middleware(['can:supprimer-commande']);
```

### Policies Laravel
```php
// app/Policies/CommandeAchatPolicy.php
public function annuler(User $user, CommandeAchat $commande)
{
    return in_array($user->role, ['Administrateur', 'AgentApprovisionnement'])
           && $commande->statut !== 'Reçue';
}

public function delete(User $user, CommandeAchat $commande)
{
    return in_array($user->role, ['Administrateur'])
           && $commande->statut === 'Brouillon';
}
```

---

## 📞 Support

Pour toute question ou problème, vérifiez :
1. Les logs Laravel : `storage/logs/laravel.log`
2. Les erreurs de validation dans les réponses JSON
3. La console du navigateur pour les erreurs frontend
4. Les requêtes réseau dans l'onglet Network

---

## 🎉 Améliorations Apportées

### Backend
✅ Gestion complète des dates de péremption
✅ Annulation de commandes avec traçabilité
✅ Mise à jour de commandes en brouillon
✅ Suppression sécurisée
✅ Validation robuste des données
✅ Gestion transactionnelle (rollback en cas d'erreur)
✅ Enregistrement des mouvements de stock

### Frontend
✅ Interface intuitive pour les dates de péremption
✅ Bouton d'annulation avec confirmation
✅ Validation côté client
✅ Messages d'erreur clairs
✅ Support de l'édition (méthodes ajoutées)

---

## 📄 Fichiers Modifiés

### Backend (à copier manuellement)
- `app/Http/Controllers/CommandeAchatController.php` ✅
- `app/Models/CommandeAchat.php` (à mettre à jour)
- `database/migrations/xxxx_add_annulation_fields_to_commande_achats_table.php` (à créer)
- `routes/api.php` (à mettre à jour)

### Frontend (déjà modifié dans ce repo)
- `src/app/core/services/all-services.ts` ✅
- `src/app/features/commandes-achat/commande-achat-details/commande-achat-details.component.ts` ✅
- `src/app/features/commandes-achat/commande-achat-details/commande-achat-details.component.html` ✅

---

**Date de création** : 11 novembre 2025
**Version** : 1.0.0
**Projet** : Agrocean - Gestion des Commandes d'Achat
