# Checklist de Débogage Backend - Erreur 500 Réception

## ❌ Erreur Actuelle
```
POST http://localhost:8000/api/commandes-achat/10/receptionner 500 (Internal Server Error)
```

## 🔍 Points à Vérifier sur le Backend Laravel

### 1. Vérifier que la Route Existe
```bash
php artisan route:list | grep receptionner
```

**Résultat attendu :**
```
POST | api/commandes-achat/{id}/receptionner | commandes-achat.receptionner
```

---

### 2. Consulter les Logs Laravel
```bash
# Voir les 50 dernières lignes
tail -50 storage/logs/laravel.log

# OU suivre en temps réel
tail -f storage/logs/laravel.log
```

**Erreurs communes :**
- ❌ `Class 'App\Models\MouvementStock' not found`
- ❌ `SQLSTATE[42S22]: Column not found: 'date_peremption'`
- ❌ `Call to undefined method calculerTotal()`
- ❌ `Undefined array key "produits"`

---

### 3. Vérifier la Structure de la Table `stocks`
```bash
php artisan tinker
```

Puis dans tinker :
```php
Schema::getColumnListing('stocks')
```

**Colonnes nécessaires :**
- ✅ `produit_id`
- ✅ `entrepot_id`
- ✅ `quantite_actuelle`
- ✅ `quantite_disponible`
- ✅ `quantite_reservee`
- ✅ `seuil_alerte`
- ⚠️ `date_peremption` (optionnel)
- ⚠️ `numero_lot` (optionnel)
- ⚠️ `prix_unitaire_achat` (optionnel)

---

### 4. Vérifier si la Table `mouvement_stocks` Existe
```php
// Dans tinker
Schema::hasTable('mouvement_stocks')
```

**Si FALSE :** Créer la migration (voir fichier `create_mouvement_stocks_table.php` ci-dessous)

---

### 5. Vérifier le Modèle `CommandeAchat`
```bash
cat app/Models/CommandeAchat.php
```

**Doit contenir la méthode :**
```php
public function calculerTotal()
{
    $total = $this->detailCommandeAchats->sum(function ($detail) {
        return $detail->quantite * $detail->prix_unitaire;
    });

    $this->montant_total = $total;
    $this->save();

    return $this;
}
```

---

### 6. Vérifier le Contrôleur Actuel
```bash
# Voir la méthode receptionner
grep -A 50 "function receptionner" app/Http/Controllers/CommandeAchatController.php
```

---

## 🚀 Solutions Rapides

### Solution A : Utiliser le Contrôleur SIMPLE (Recommandé)

**Remplacer le contrôleur actuel :**
```bash
# Si vous avez le fichier CommandeAchatController_SIMPLE.php
cp CommandeAchatController_SIMPLE.php app/Http/Controllers/CommandeAchatController.php
```

**Avantages :**
- ✅ Vérifie l'existence des colonnes avant de les utiliser
- ✅ Fonctionne avec ou sans migration
- ✅ Gère les dates de péremption si disponibles
- ✅ Compatible avec l'ancien système

---

### Solution B : Ajouter la Route Manquante

Si la route n'existe pas, ajoutez dans `routes/api.php` :

```php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/commandes-achat/{id}/receptionner',
        [CommandeAchatController::class, 'receptionner']);
});
```

---

### Solution C : Créer la Migration Manquante

**Si la table `mouvement_stocks` n'existe pas :**

```bash
php artisan make:migration create_mouvement_stocks_table
```

Contenu de la migration :
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
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
    }

    public function down()
    {
        Schema::dropIfExists('mouvement_stocks');
    }
};
```

Puis :
```bash
php artisan migrate
```

---

### Solution D : Version Minimale du Contrôleur

Si tout échoue, voici une version ultra-simple de `receptionner()` :

```php
public function receptionner(Request $request, $id)
{
    $validator = Validator::make($request->all(), [
        'entrepot_id' => 'required|exists:entrepots,id'
    ]);

    if ($validator->fails()) {
        return response()->json(['error' => 'Validation échouée'], 422);
    }

    $commande = CommandeAchat::with('detailCommandeAchats.produit')->findOrFail($id);

    if (!in_array($commande->statut, ['Validée', 'EnCours'])) {
        return response()->json(['error' => 'Statut invalide'], 400);
    }

    DB::beginTransaction();

    try {
        // Pour chaque produit, mettre à jour le stock
        foreach ($commande->detailCommandeAchats as $detail) {
            $stock = Stock::where('produit_id', $detail->produit_id)
                ->where('entrepot_id', $request->entrepot_id)
                ->first();

            if ($stock) {
                $stock->quantite_actuelle += $detail->quantite;
                $stock->quantite_disponible += $detail->quantite;
                $stock->save();
            } else {
                Stock::create([
                    'produit_id' => $detail->produit_id,
                    'entrepot_id' => $request->entrepot_id,
                    'quantite_actuelle' => $detail->quantite,
                    'quantite_disponible' => $detail->quantite,
                    'quantite_reservee' => 0,
                    'seuil_alerte' => 10,
                ]);
            }
        }

        $commande->statut = 'Reçue';
        $commande->save();

        DB::commit();

        return response()->json([
            'message' => 'Commande réceptionnée avec succès',
            'commande' => $commande
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'error' => 'Erreur lors de la réception',
            'details' => $e->getMessage()
        ], 500);
    }
}
```

---

## 📊 Ordre de Priorité des Solutions

1. **D'abord** : Consulter les logs → `tail -50 storage/logs/laravel.log`
2. **Ensuite** : Vérifier les routes → `php artisan route:list | grep receptionner`
3. **Puis** : Copier `CommandeAchatController_SIMPLE.php`
4. **Enfin** : Créer les migrations manquantes si nécessaire

---

## 🆘 Si Rien ne Fonctionne

Envoyez-moi :
1. Le contenu de `storage/logs/laravel.log` (dernières 50 lignes)
2. Le résultat de `php artisan route:list | grep commandes-achat`
3. Le résultat de `Schema::getColumnListing('stocks')` dans tinker

Et je vous donnerai une solution personnalisée !

---

**Dernière mise à jour** : 11 novembre 2025
