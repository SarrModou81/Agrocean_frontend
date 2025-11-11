<?php
// app/Http/Controllers/CommandeAchatController.php
// CORRECTION POUR LA MÉTHODE receptionner()

/**
 * Réceptionner une commande d'achat
 */
public function receptionner(Request $request, $id)
{
    $validator = Validator::make($request->all(), [
        'entrepot_id' => 'required|exists:entrepots,id',
        'produits' => 'required|array',
        'produits.*.detail_commande_achat_id' => 'required|exists:detail_commande_achats,id',
        'produits.*.date_peremption' => 'nullable|date|after:today'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'error' => 'Validation échouée',
            'details' => $validator->errors()
        ], 422);
    }

    try {
        DB::beginTransaction();

        $commande = CommandeAchat::with('detailCommandeAchats.produit')->findOrFail($id);

        // Vérifier que la commande peut être réceptionnée
        if (!in_array($commande->statut, ['Validée', 'EnCours'])) {
            return response()->json([
                'error' => 'Cette commande ne peut pas être réceptionnée',
                'statut_actuel' => $commande->statut
            ], 400);
        }

        $entrepotId = $request->entrepot_id;
        $entrepot = Entrepot::findOrFail($entrepotId);

        // Créer un tableau associatif pour accéder rapidement aux dates de péremption
        $datesPeremption = collect($request->produits)->keyBy('detail_commande_achat_id');

        // Pour chaque détail de commande, créer une entrée de stock
        foreach ($commande->detailCommandeAchats as $detail) {
            // Récupérer la date de péremption pour ce produit
            $produitData = $datesPeremption->get($detail->id);
            $datePeremption = $produitData && isset($produitData['date_peremption'])
                ? $produitData['date_peremption']
                : null;

            // Vérifier la capacité de l'entrepôt
            $capaciteDisponible = $entrepot->verifierCapacite();
            if ($capaciteDisponible < $detail->quantite) {
                DB::rollBack();
                return response()->json([
                    'error' => 'Capacité de l\'entrepôt insuffisante',
                    'produit' => $detail->produit->nom,
                    'capacite_disponible' => $capaciteDisponible,
                    'quantite_demandee' => $detail->quantite
                ], 400);
            }

            // Créer l'entrée de stock avec la date de péremption
            $stock = Stock::create([
                'produit_id' => $detail->produit_id,
                'entrepot_id' => $entrepotId,
                'quantite' => $detail->quantite,
                'emplacement' => 'Zone-' . strtoupper(substr($detail->produit->categorie->nom ?? 'GENERAL', 0, 3)),
                'date_entree' => now(),
                'numero_lot' => 'LOT-CMD' . $commande->id . '-' . $detail->id . '-' . date('YmdHis'),
                'date_peremption' => $datePeremption, // IMPORTANT: Utiliser la date envoyée
                'statut' => 'Disponible'
            ]);

            // Enregistrer le mouvement de stock
            MouvementStock::create([
                'produit_id' => $detail->produit_id,
                'entrepot_id' => $entrepotId,
                'type' => 'Entrée',
                'quantite' => $detail->quantite,
                'numero_lot' => $stock->numero_lot,
                'date' => now(),
                'motif' => 'Réception commande ' . $commande->numero,
                'reference_type' => 'CommandeAchat',
                'reference_id' => $commande->id,
                'user_id' => auth()->id()
            ]);

            Log::info('Stock créé avec date péremption', [
                'stock_id' => $stock->id,
                'produit' => $detail->produit->nom,
                'quantite' => $detail->quantite,
                'date_peremption' => $datePeremption,
                'numero_lot' => $stock->numero_lot
            ]);
        }

        // Mettre à jour le statut de la commande
        $commande->statut = 'Reçue';
        $commande->save();

        DB::commit();

        return response()->json([
            'message' => 'Commande réceptionnée avec succès',
            'commande' => $commande->load('detailCommandeAchats.produit')
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Erreur réception commande', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'commande_id' => $id,
            'request' => $request->all()
        ]);

        return response()->json([
            'error' => 'Erreur lors de la réception',
            'message' => $e->getMessage()
        ], 500);
    }
}
