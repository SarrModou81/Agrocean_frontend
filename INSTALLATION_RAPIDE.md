# Installation Rapide - Correction Erreur 500

## 🚀 3 Étapes pour Corriger l'Erreur

### Étape 1 : Exécuter la Migration

Sur votre serveur backend Laravel :

```bash
cd /chemin/vers/votre/backend/laravel

# Créer le fichier de migration
nano database/migrations/2025_11_11_120000_add_annulation_fields_to_commande_achats_table.php
```

Copiez ce contenu dans le fichier :

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('commande_achats', function (Blueprint $table) {
            if (!Schema::hasColumn('commande_achats', 'motif_annulation')) {
                $table->text('motif_annulation')->nullable()->after('statut');
            }
            if (!Schema::hasColumn('commande_achats', 'date_annulation')) {
                $table->timestamp('date_annulation')->nullable()->after('motif_annulation');
            }
            if (!Schema::hasColumn('commande_achats', 'annule_par')) {
                $table->unsignedBigInteger('annule_par')->nullable()->after('date_annulation');
            }
            if (!Schema::hasColumn('commande_achats', 'date_reception')) {
                $table->timestamp('date_reception')->nullable()->after('date_livraison_prevue');
            }

            // Clé étrangère pour l'utilisateur qui a annulé
            if (!Schema::hasColumn('commande_achats', 'annule_par')) {
                $table->foreign('annule_par')
                      ->references('id')
                      ->on('users')
                      ->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('commande_achats', function (Blueprint $table) {
            if (Schema::hasColumn('commande_achats', 'annule_par')) {
                $table->dropForeign(['annule_par']);
            }

            $columns = ['motif_annulation', 'date_annulation', 'annule_par', 'date_reception'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('commande_achats', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
```

Puis exécutez :

```bash
php artisan migrate
```

---

### Étape 2 : Ajouter la Route d'Annulation

Éditez le fichier `routes/api.php` :

```bash
nano routes/api.php
```

Ajoutez cette route dans le groupe `auth:sanctum` :

```php
Route::middleware(['auth:sanctum'])->group(function () {
    // ... autres routes ...

    // Route d'annulation (NOUVELLE)
    Route::post('/commandes-achat/{id}/annuler', [CommandeAchatController::class, 'annuler']);
});
```

---

### Étape 3 : Remplacer le Contrôleur

```bash
# Sauvegarder l'ancien contrôleur
cp app/Http/Controllers/CommandeAchatController.php app/Http/Controllers/CommandeAchatController.php.backup

# Copier le nouveau contrôleur
# (Copiez le contenu de CommandeAchatController_COMPATIBLE_BDD.php)
nano app/Http/Controllers/CommandeAchatController.php
```

Puis effacez le cache :

```bash
php artisan config:clear
php artisan route:clear
php artisan cache:clear
```

---

## ✅ Vérification

Testez que tout fonctionne :

```bash
# Vérifier que la route existe
php artisan route:list | grep commandes-achat

# Vérifier les colonnes de la table
php artisan tinker
>>> Schema::getColumnListing('commande_achats')
>>> exit
```

---

## 🎯 Si Vous Préférez Tout Faire en Une Fois

Voici un script bash qui fait tout automatiquement :

```bash
#!/bin/bash

echo "🚀 Installation des modifications commandes d'achat..."

# 1. Migration
cat > database/migrations/2025_11_11_120000_add_annulation_fields_to_commande_achats_table.php << 'EOF'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('commande_achats', function (Blueprint $table) {
            if (!Schema::hasColumn('commande_achats', 'motif_annulation')) {
                $table->text('motif_annulation')->nullable()->after('statut');
            }
            if (!Schema::hasColumn('commande_achats', 'date_annulation')) {
                $table->timestamp('date_annulation')->nullable();
            }
            if (!Schema::hasColumn('commande_achats', 'annule_par')) {
                $table->unsignedBigInteger('annule_par')->nullable();
                $table->foreign('annule_par')->references('id')->on('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('commande_achats', 'date_reception')) {
                $table->timestamp('date_reception')->nullable();
            }
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
EOF

# 2. Exécuter la migration
php artisan migrate

# 3. Sauvegarder l'ancien contrôleur
cp app/Http/Controllers/CommandeAchatController.php app/Http/Controllers/CommandeAchatController.php.backup

# 4. Effacer le cache
php artisan config:clear
php artisan route:clear
php artisan cache:clear

echo "✅ Installation terminée !"
echo "⚠️  N'oubliez pas de :"
echo "   1. Copier le nouveau contrôleur (CommandeAchatController_COMPATIBLE_BDD.php)"
echo "   2. Ajouter la route /annuler dans routes/api.php"
```

Sauvegardez ce script dans `install.sh`, puis :

```bash
chmod +x install.sh
./install.sh
```

---

## 📋 Points Importants

### Différences avec Votre Base de Données

Le nouveau contrôleur est compatible avec :

✅ **Table `mouvements_stock`** (votre nom de table)
- Champs : `type`, `stock_id`, `produit_id`, `entrepot_id`, `quantite`
- `reference_type` et `reference_id` (au lieu de `commande_achat_id`)
- Champ `date` (au lieu de `date_mouvement`)

✅ **Table `detail_commande_achats`**
- Tous les champs nécessaires sont présents

✅ **Vérification automatique des colonnes**
- Le code vérifie si les colonnes existent avant de les utiliser
- Fonctionne même si certains champs optionnels sont absents

---

## 🆘 En Cas de Problème

### Erreur de Migration

Si la migration échoue avec "Column already exists" :

```bash
php artisan migrate:rollback --step=1
# Puis relancez
php artisan migrate
```

### Erreur de Route

Vérifiez que la route est bien dans le groupe `auth:sanctum` :

```php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/commandes-achat/{id}/annuler', [CommandeAchatController::class, 'annuler']);
});
```

### Toujours Erreur 500

Consultez les logs :

```bash
tail -50 storage/logs/laravel.log
```

Et envoyez-moi le message d'erreur pour un diagnostic précis.

---

## 📞 Support

Après l'installation, testez la réception d'une commande. Si ça ne fonctionne toujours pas, envoyez-moi :

1. Le résultat de `tail -50 storage/logs/laravel.log`
2. Le résultat de `php artisan route:list | grep commandes-achat`

Et je vous aiderai à résoudre le problème spécifique.
