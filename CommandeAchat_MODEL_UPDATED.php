<?php

// app/Models/CommandeAchat.php
// VERSION MISE À JOUR avec support de l'annulation

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommandeAchat extends Model
{
    use HasFactory;

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

    public function calculerTotal()
    {
        $this->montant_total = $this->detailCommandeAchats->sum('sous_total');
        $this->save();
    }

    public function valider()
    {
        $this->statut = 'Validée';
        $this->save();
    }

    public function factureFournisseur()
    {
        return $this->hasOne(FactureFournisseur::class);
    }

    public function receptionner($entrepot_id)
    {
        foreach ($this->detailCommandeAchats as $detail) {
            $stock = Stock::create([
                'produit_id' => $detail->produit_id,
                'entrepot_id' => $entrepot_id,
                'quantite' => $detail->quantite,
                'emplacement' => 'Zone-A',
                'date_entree' => now(),
                'numero_lot' => 'LOT' . date('Ymd') . $this->id,
                'statut' => 'Disponible'
            ]);

            // Créer le mouvement d'entrée
            MouvementStock::create([
                'type' => 'Entrée',
                'stock_id' => $stock->id,
                'produit_id' => $detail->produit_id,
                'entrepot_id' => $entrepot_id,
                'quantite' => $detail->quantite,
                'numero_lot' => $stock->numero_lot,
                'motif' => "Réception commande N° {$this->numero}",
                'reference_type' => 'CommandeAchat',
                'reference_id' => $this->id,
                'user_id' => auth()->id(),
                'date' => now()
            ]);
        }

        $this->statut = 'Reçue';
        $this->save();

        // Générer automatiquement la facture fournisseur
        $this->genererFactureFournisseur();
    }

    public function genererFactureFournisseur()
    {
        if ($this->factureFournisseur) {
            return $this->factureFournisseur;
        }

        return FactureFournisseur::create([
            'numero' => 'FF' . date('Y') . str_pad($this->id, 6, '0', STR_PAD_LEFT),
            'commande_achat_id' => $this->id,
            'fournisseur_id' => $this->fournisseur_id,
            'date_emission' => now(),
            'date_echeance' => now()->addDays(30),
            'montant_total' => $this->montant_total,
            'statut' => 'Impayée'
        ]);
    }
}
