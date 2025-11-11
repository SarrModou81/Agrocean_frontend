<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration pour créer la table mouvement_stocks
 * Nécessaire pour la traçabilité des mouvements de stock
 *
 * À placer dans : database/migrations/
 * Renommer avec : YYYY_MM_DD_HHMMSS_create_mouvement_stocks_table.php
 * Exemple : 2025_11_11_120000_create_mouvement_stocks_table.php
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mouvement_stocks', function (Blueprint $table) {
            $table->id();

            // Relations
            $table->foreignId('produit_id')
                  ->constrained('produits')
                  ->onDelete('cascade');

            $table->foreignId('entrepot_id')
                  ->constrained('entrepots')
                  ->onDelete('cascade');

            // Type de mouvement
            $table->enum('type_mouvement', ['Entrée', 'Sortie', 'Ajustement', 'Transfert']);

            // Quantité
            $table->integer('quantite');

            // Date du mouvement
            $table->timestamp('date_mouvement');

            // Utilisateur qui a effectué le mouvement
            $table->foreignId('user_id')->constrained('users');

            // Référence (ex: "Réception commande CA202500001")
            $table->text('reference')->nullable();

            // Relations optionnelles vers les commandes
            $table->foreignId('commande_achat_id')
                  ->nullable()
                  ->constrained('commande_achats')
                  ->onDelete('set null');

            $table->foreignId('commande_vente_id')
                  ->nullable()
                  ->constrained('commande_ventes')
                  ->onDelete('set null');

            $table->timestamps();

            // Index pour améliorer les performances
            $table->index('date_mouvement');
            $table->index('type_mouvement');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mouvement_stocks');
    }
};
