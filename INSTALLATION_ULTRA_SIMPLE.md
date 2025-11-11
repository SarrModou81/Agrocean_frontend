# 🚀 Installation Ultra-Simple - 3 Commandes

## Problème Actuel
❌ Erreur 500 lors de la réception : `POST http://localhost:8000/api/commandes-achat/10/receptionner 500`

## ✅ Solution en 3 Étapes (5 minutes)

### 📍 Sur votre serveur backend Laravel

---

## ÉTAPE 1 : Migration (1 minute)

```bash
cd /chemin/vers/votre/backend

# Copier-coller TOUT ce bloc de commandes :
cat > database/migrations/2025_11_11_120000_add_annulation_fields_to_commande_achats_table.php << 'MIGRATION_EOF'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('commande_achats', function (Blueprint $table) {
            $table->text('motif_annulation')->nullable();
            $table->timestamp('date_annulation')->nullable();
            $table->unsignedBigInteger('annule_par')->nullable();
            $table->timestamp('date_reception')->nullable();

            $table->foreign('annule_par')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('commande_achats', function (Blueprint $table) {
            $table->dropForeign(['annule_par']);
            $table->dropColumn(['motif_annulation', 'date_annulation', 'annule_par', 'date_reception']);
        });
    }
};
MIGRATION_EOF

# Exécuter la migration
php artisan migrate
```

---

## ÉTAPE 2 : Ajouter la Route (30 secondes)

```bash
# Ouvrir le fichier routes/api.php
nano routes/api.php
```

Cherchez le groupe `Route::middleware(['auth:sanctum'])` et ajoutez cette ligne :

```php
Route::post('/commandes-achat/{id}/annuler', [CommandeAchatController::class, 'annuler']);
```

**Exemple complet :**

```php
Route::middleware(['auth:sanctum'])->group(function () {
    // ... autres routes ...

    // Commandes d'achat
    Route::get('/commandes-achat', [CommandeAchatController::class, 'index']);
    Route::post('/commandes-achat', [CommandeAchatController::class, 'store']);
    Route::get('/commandes-achat/{id}', [CommandeAchatController::class, 'show']);
    Route::post('/commandes-achat/{id}/valider', [CommandeAchatController::class, 'valider']);
    Route::post('/commandes-achat/{id}/receptionner', [CommandeAchatController::class, 'receptionner']);
    Route::post('/commandes-achat/{id}/annuler', [CommandeAchatController::class, 'annuler']);  // ← AJOUTER CETTE LIGNE
});
```

Sauvegardez avec `Ctrl+O`, `Entrée`, puis `Ctrl+X`

---

## ÉTAPE 3 : Remplacer les Fichiers (2 minutes)

```bash
# Sauvegarder les fichiers originaux
cp app/Http/Controllers/CommandeAchatController.php app/Http/Controllers/CommandeAchatController.php.backup
cp app/Models/CommandeAchat.php app/Models/CommandeAchat.php.backup
```

### 3A - Remplacer le Contrôleur

```bash
nano app/Http/Controllers/CommandeAchatController.php
```

Supprimez TOUT le contenu et copiez le contenu de **`CommandeAchatController_FINAL.php`**

### 3B - Mettre à jour le Modèle

```bash
nano app/Models/CommandeAchat.php
```

Remplacez la partie `protected $fillable` et `protected $casts` par :

```php
protected $fillable = [
    'numero',
    'fournisseur_id',
    'user_id',
    'date_commande',
    'date_livraison_prevue',
    'statut',
    'montant_total',
    'motif_annulation',      // NOUVEAU
    'date_annulation',        // NOUVEAU
    'annule_par',             // NOUVEAU
    'date_reception'          // NOUVEAU
];

protected $casts = [
    'date_commande' => 'date',
    'date_livraison_prevue' => 'date',
    'date_annulation' => 'datetime',     // NOUVEAU
    'date_reception' => 'datetime',      // NOUVEAU
    'montant_total' => 'decimal:2',
];
```

Ajoutez aussi cette nouvelle relation après les autres relations :

```php
public function annulePar()
{
    return $this->belongsTo(User::class, 'annule_par');
}
```

### 3C - Effacer le Cache

```bash
php artisan config:clear
php artisan route:clear
php artisan cache:clear
```

---

## ✅ Vérification

```bash
# Vérifier que la route existe
php artisan route:list | grep "commandes-achat"

# Vérifier que les colonnes ont été ajoutées
php artisan tinker
>>> \Schema::getColumnListing('commande_achats')
>>> exit
```

Vous devriez voir les colonnes : `motif_annulation`, `date_annulation`, `annule_par`, `date_reception`

---

## 🎯 Tester

1. Rafraîchissez votre page Angular (F5)
2. Essayez de réceptionner une commande
3. **Ça devrait fonctionner maintenant !** ✅

---

## 🆘 Si Ça Ne Fonctionne Toujours Pas

Consultez les logs Laravel pour voir l'erreur exacte :

```bash
tail -50 storage/logs/laravel.log
```

Et envoyez-moi le message d'erreur.

---

## 📋 Résumé des Changements

### Ce qui a été ajouté :

✅ **Réception avec dates de péremption**
- Les dates de péremption sont maintenant capturées lors de la réception
- Compatible avec votre structure de BDD (table `stocks` et `mouvements_stock`)

✅ **Annulation de commandes**
- Nouvelle méthode `annuler()` dans le contrôleur
- Champs ajoutés : `motif_annulation`, `date_annulation`, `annule_par`
- Bouton "Annuler" dans l'interface

✅ **Gestion des erreurs améliorée**
- Messages d'erreur détaillés en cas de problème
- Validation robuste des données

### Structure Compatible :

Le nouveau code utilise **EXACTEMENT** votre structure de BDD :

**Table `stocks` :**
- `quantite` (pas `quantite_actuelle`, `quantite_disponible`)
- `emplacement`, `date_entree`, `statut`, `numero_lot`
- `date_peremption` (ajoutée si elle n'existe pas)

**Table `mouvements_stock` :**
- `type`, `stock_id`, `produit_id`, `entrepot_id`, `quantite`
- `reference_type` et `reference_id` (pas `commande_achat_id`)
- `date` (pas `date_mouvement`)

---

## 🎉 Résultat Final

Après ces 3 étapes, vous pourrez :

1. ✅ **Réceptionner des commandes** avec dates de péremption optionnelles
2. ✅ **Annuler des commandes** avec motif
3. ✅ **Tracer toutes les opérations** (qui, quand, pourquoi)
4. ✅ **Générer automatiquement les factures fournisseurs** (comme avant)

---

**Temps d'installation total : 5 minutes**

**Questions ? Envoyez-moi les logs !**
