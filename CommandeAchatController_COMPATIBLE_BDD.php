<?php

// app/Http/Controllers/CommandeAchatController.php
// VERSION COMPATIBLE AVEC VOTRE STRUCTURE DE BDD EXISTANTE

namespace App\Http\Controllers;

use App\Models\CommandeAchat;
use App\Models\DetailCommandeAchat;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CommandeAchatController extends Controller
{
    public function index(Request $request)
    {
        $query = CommandeAchat::with(['fournisseur', 'user', 'detailCommandeAchats.produit']);

        if ($request->has('fournisseur_id')) {
            $query->where('fournisseur_id', $request->fournisseur_id);
        }

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        $commandes = $query->orderBy('date_commande', 'desc')->paginate(20);

        return response()->json($commandes);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fournisseur_id' => 'required|exists:fournisseurs,id',
            'date_commande' => 'required|date',
            'date_livraison_prevue' => 'nullable|date',
            'produits' => 'required|array|min:1',
            'produits.*.produit_id' => 'required|exists:produits,id',
            'produits.*.quantite' => 'required|integer|min:1',
            'produits.*.prix_unitaire' => 'required|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        DB::beginTransaction();

        try {
            $commande = CommandeAchat::create([
                'numero' => 'CA' . date('Y') . str_pad(CommandeAchat::count() + 1, 6, '0', STR_PAD_LEFT),
                'fournisseur_id' => $request->fournisseur_id,
                'user_id' => auth()->id(),
                'date_commande' => $request->date_commande,
                'date_livraison_prevue' => $request->date_livraison_prevue,
                'statut' => 'Brouillon',
                'montant_total' => 0
            ]);

            foreach ($request->produits as $item) {
                DetailCommandeAchat::create([
                    'commande_achat_id' => $commande->id,
                    'produit_id' => $item['produit_id'],
                    'quantite' => $item['quantite'],
                    'prix_unitaire' => $item['prix_unitaire'],
                    'sous_total' => $item['quantite'] * $item['prix_unitaire']
                ]);
            }

            $commande->calculerTotal();

            DB::commit();

            return response()->json([
                'message' => 'Commande d\'achat créée avec succès',
                'commande' => $commande->load(['fournisseur', 'detailCommandeAchats.produit'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Erreur lors de la création de la commande',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $commande = CommandeAchat::with([
            'fournisseur',
            'user',
            'detailCommandeAchats.produit'
        ])->findOrFail($id);

        return response()->json($commande);
    }

    public function valider($id)
    {
        $commande = CommandeAchat::findOrFail($id);

        if ($commande->statut != 'Brouillon') {
            return response()->json([
                'error' => 'Seules les commandes en brouillon peuvent être validées'
            ], 400);
        }

        $commande->valider();

        return response()->json([
            'message' => 'Commande validée avec succès',
            'commande' => $commande
        ]);
    }

    /**
     * Réceptionner une commande avec gestion des dates de péremption
     * Compatible avec votre structure de BDD (table mouvements_stock)
     */
    public function receptionner(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'entrepot_id' => 'required|exists:entrepots,id',
            'produits' => 'nullable|array',
            'produits.*.detail_commande_achat_id' => 'required_with:produits|exists:detail_commande_achats,id',
            'produits.*.date_peremption' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation échouée',
                'errors' => $validator->errors()
            ], 422);
        }

        $commande = CommandeAchat::with('detailCommandeAchats.produit')->findOrFail($id);

        if (!in_array($commande->statut, ['Validée', 'EnCours'])) {
            return response()->json([
                'error' => 'Seules les commandes validées ou en cours peuvent être réceptionnées'
            ], 400);
        }

        DB::beginTransaction();

        try {
            // Créer un tableau associatif des dates de péremption
            $datesPeremption = [];
            if ($request->has('produits') && is_array($request->produits)) {
                foreach ($request->produits as $produitData) {
                    if (isset($produitData['detail_commande_achat_id'])) {
                        $datesPeremption[$produitData['detail_commande_achat_id']] =
                            $produitData['date_peremption'] ?? null;
                    }
                }
            }

            // Traiter chaque produit de la commande
            foreach ($commande->detailCommandeAchats as $detail) {
                $datePeremption = $datesPeremption[$detail->id] ?? null;

                // Chercher un stock existant
                $stockQuery = Stock::where('produit_id', $detail->produit_id)
                    ->where('entrepot_id', $request->entrepot_id);

                // Si date de péremption fournie, chercher le stock avec cette date
                if ($datePeremption) {
                    if (Schema::hasColumn('stocks', 'date_peremption')) {
                        $stockQuery->where('date_peremption', $datePeremption);
                    }
                } else {
                    if (Schema::hasColumn('stocks', 'date_peremption')) {
                        $stockQuery->whereNull('date_peremption');
                    }
                }

                $stock = $stockQuery->first();

                if ($stock) {
                    // Mettre à jour le stock existant
                    $stock->quantite_actuelle += $detail->quantite;
                    $stock->quantite_disponible += $detail->quantite;
                    $stock->save();

                    $stockId = $stock->id;
                } else {
                    // Créer un nouveau stock
                    $stockData = [
                        'produit_id' => $detail->produit_id,
                        'entrepot_id' => $request->entrepot_id,
                        'quantite_actuelle' => $detail->quantite,
                        'quantite_disponible' => $detail->quantite,
                        'quantite_reservee' => 0,
                        'seuil_alerte' => $detail->produit->seuil_alerte ?? 10,
                    ];

                    // Ajouter les champs optionnels s'ils existent
                    if (Schema::hasColumn('stocks', 'date_peremption')) {
                        $stockData['date_peremption'] = $datePeremption;
                    }

                    if (Schema::hasColumn('stocks', 'numero_lot')) {
                        $stockData['numero_lot'] = $commande->numero . '-' . $detail->id;
                    }

                    if (Schema::hasColumn('stocks', 'prix_unitaire_achat')) {
                        $stockData['prix_unitaire_achat'] = $detail->prix_unitaire;
                    }

                    $newStock = Stock::create($stockData);
                    $stockId = $newStock->id;
                }

                // Créer un mouvement de stock avec VOTRE structure de table (mouvements_stock)
                $mouvementData = [
                    'type' => 'Entrée',
                    'stock_id' => $stockId,
                    'produit_id' => $detail->produit_id,
                    'entrepot_id' => $request->entrepot_id,
                    'quantite' => $detail->quantite,
                    'motif' => 'Réception commande ' . $commande->numero,
                    'reference_type' => 'CommandeAchat',
                    'reference_id' => $commande->id,
                    'user_id' => auth()->id(),
                    'date' => now(),
                    'created_at' => now(),
                    'updated_at' => now()
                ];

                // Ajouter numero_lot si fourni
                if (Schema::hasColumn('mouvements_stock', 'numero_lot')) {
                    $mouvementData['numero_lot'] = $commande->numero . '-' . $detail->id;
                }

                DB::table('mouvements_stock')->insert($mouvementData);
            }

            // Mettre à jour le statut de la commande
            $commande->statut = 'Reçue';

            // Ajouter date_reception si la colonne existe
            if (Schema::hasColumn('commande_achats', 'date_reception')) {
                $commande->date_reception = now();
            }

            $commande->save();

            DB::commit();

            return response()->json([
                'message' => 'Commande réceptionnée avec succès',
                'commande' => $commande->load(['fournisseur', 'detailCommandeAchats.produit'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Erreur lors de la réception de la commande',
                'details' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Annuler une commande
     */
    public function annuler(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'motif' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation échouée',
                'errors' => $validator->errors()
            ], 422);
        }

        $commande = CommandeAchat::findOrFail($id);

        // Vérifier que la commande n'est pas déjà réceptionnée
        if ($commande->statut === 'Reçue') {
            return response()->json([
                'error' => 'Impossible d\'annuler une commande déjà réceptionnée'
            ], 400);
        }

        // Vérifier que la commande n'est pas déjà annulée
        if ($commande->statut === 'Annulée') {
            return response()->json([
                'error' => 'Cette commande est déjà annulée'
            ], 400);
        }

        DB::beginTransaction();

        try {
            $commande->statut = 'Annulée';

            // Ajouter les champs si les colonnes existent
            if (Schema::hasColumn('commande_achats', 'motif_annulation')) {
                $commande->motif_annulation = $request->motif ?? 'Annulation sans motif spécifié';
            }

            if (Schema::hasColumn('commande_achats', 'date_annulation')) {
                $commande->date_annulation = now();
            }

            if (Schema::hasColumn('commande_achats', 'annule_par')) {
                $commande->annule_par = auth()->id();
            }

            $commande->save();

            DB::commit();

            return response()->json([
                'message' => 'Commande annulée avec succès',
                'commande' => $commande->load(['fournisseur', 'detailCommandeAchats.produit'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Erreur lors de l\'annulation de la commande',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour une commande en brouillon
     */
    public function update(Request $request, $id)
    {
        $commande = CommandeAchat::findOrFail($id);

        if ($commande->statut !== 'Brouillon') {
            return response()->json([
                'error' => 'Seules les commandes en brouillon peuvent être modifiées'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'fournisseur_id' => 'sometimes|required|exists:fournisseurs,id',
            'date_commande' => 'sometimes|required|date',
            'date_livraison_prevue' => 'nullable|date|after_or_equal:date_commande',
            'produits' => 'sometimes|required|array|min:1',
            'produits.*.produit_id' => 'required_with:produits|exists:produits,id',
            'produits.*.quantite' => 'required_with:produits|integer|min:1',
            'produits.*.prix_unitaire' => 'required_with:produits|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation échouée',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            $commande->update([
                'fournisseur_id' => $request->fournisseur_id ?? $commande->fournisseur_id,
                'date_commande' => $request->date_commande ?? $commande->date_commande,
                'date_livraison_prevue' => $request->date_livraison_prevue ?? $commande->date_livraison_prevue
            ]);

            if ($request->has('produits')) {
                DetailCommandeAchat::where('commande_achat_id', $commande->id)->delete();

                foreach ($request->produits as $item) {
                    DetailCommandeAchat::create([
                        'commande_achat_id' => $commande->id,
                        'produit_id' => $item['produit_id'],
                        'quantite' => $item['quantite'],
                        'prix_unitaire' => $item['prix_unitaire'],
                        'sous_total' => $item['quantite'] * $item['prix_unitaire']
                    ]);
                }

                $commande->calculerTotal();
            }

            DB::commit();

            return response()->json([
                'message' => 'Commande mise à jour avec succès',
                'commande' => $commande->load(['fournisseur', 'detailCommandeAchats.produit'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Erreur lors de la mise à jour de la commande',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer une commande en brouillon
     */
    public function destroy($id)
    {
        $commande = CommandeAchat::findOrFail($id);

        if ($commande->statut !== 'Brouillon') {
            return response()->json([
                'error' => 'Seules les commandes en brouillon peuvent être supprimées'
            ], 400);
        }

        DB::beginTransaction();

        try {
            DetailCommandeAchat::where('commande_achat_id', $commande->id)->delete();
            $commande->delete();

            DB::commit();

            return response()->json([
                'message' => 'Commande supprimée avec succès'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Erreur lors de la suppression de la commande',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
