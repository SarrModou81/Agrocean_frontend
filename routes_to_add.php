<?php

/**
 * ROUTES À AJOUTER DANS routes/api.php
 *
 * Ces routes doivent être ajoutées dans le groupe middleware(['auth:sanctum'])
 * pour assurer l'authentification des requêtes
 */

// ==================== COMMANDES D'ACHAT ====================
Route::prefix('commandes-achat')->group(function () {

    // Routes existantes (pour référence)
    Route::get('/', [CommandeAchatController::class, 'index']);
    Route::post('/', [CommandeAchatController::class, 'store']);
    Route::get('/{id}', [CommandeAchatController::class, 'show']);

    // Actions sur les commandes
    Route::post('/{id}/valider', [CommandeAchatController::class, 'valider']);
    Route::post('/{id}/receptionner', [CommandeAchatController::class, 'receptionner']);

    // 🆕 NOUVELLES ROUTES À AJOUTER
    Route::post('/{id}/annuler', [CommandeAchatController::class, 'annuler']);
    Route::put('/{id}', [CommandeAchatController::class, 'update']);
    Route::delete('/{id}', [CommandeAchatController::class, 'destroy']);
});

// OU VERSION SANS PREFIX (si vous utilisez déjà le chemin complet)

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

// ==================== AVEC PERMISSIONS (OPTIONNEL) ====================
// Si vous utilisez des permissions/policies Laravel

Route::post('/commandes-achat/{id}/annuler', [CommandeAchatController::class, 'annuler'])
    ->middleware(['permission:annuler-commande']);

Route::put('/commandes-achat/{id}', [CommandeAchatController::class, 'update'])
    ->middleware(['permission:modifier-commande']);

Route::delete('/commandes-achat/{id}', [CommandeAchatController::class, 'destroy'])
    ->middleware(['permission:supprimer-commande']);
