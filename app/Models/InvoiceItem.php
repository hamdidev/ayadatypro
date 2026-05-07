<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends Model
{
    protected $fillable = [
        'invoice_id',
        'description',
        'quantity',
        'unit_price',
        'total',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    // ─────────────────────────────────────────────────────────────
    // BOOT
    // ─────────────────────────────────────────────────────────────

    protected static function booted(): void
    {
        // Auto-calculate total from quantity × unit_price before save
        static::saving(function (InvoiceItem $item) {
            $item->total = round($item->quantity * $item->unit_price, 2);
        });

        // Recalculate parent invoice totals whenever an item changes
        static::saved(function (InvoiceItem $item) {
            $item->invoice->recalculateTotals();
        });

        static::deleted(function (InvoiceItem $item) {
            $item->invoice->recalculateTotals();
        });
    }

    // ─────────────────────────────────────────────────────────────
    // RELATIONSHIPS
    // ─────────────────────────────────────────────────────────────

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
