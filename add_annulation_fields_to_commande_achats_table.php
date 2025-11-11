<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration pour ajouter les champs d'annulation et de réception
 * aux commandes d'achat
 *
 * À placer dans : database/migrations/
 * Renommer le fichier avec le format : YYYY_MM_DD_HHMMSS_add_annulation_fields_to_commande_achats_table.php
 * Exemple : 2025_11_11_120000_add_annulation_fields_to_commande_achats_table.php
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('commande_achats', function (Blueprint $table) {
            // Champs pour l'annulation
            $table->text('motif_annulation')->nullable()->after('statut');
            $table->timestamp('date_annulation')->nullable()->after('motif_annulation');
            $table->unsignedBigInteger('annule_par')->nullable()->after('date_annulation');

            // Champ pour la date de réception
            $table->timestamp('date_reception')->nullable()->after('date_livraison_prevue');

            // Clé étrangère pour l'utilisateur qui a annulé
            $table->foreign('annule_par')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('commande_achats', function (Blueprint $table) {
            // Supprimer la clé étrangère d'abord
            $table->dropForeign(['annule_par']);

            // Supprimer les colonnes
            $table->dropColumn([
                'motif_annulation',
                'date_annulation',
                'annule_par',
                'date_reception'
            ]);
        });
    }
};
