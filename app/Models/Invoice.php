<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'visit_id',
        'clinic_id',
        'patient_id',
        'invoice_number',
        'subtotal',
        'discount',
        'total',
        'status',
        'amount_paid',
        'payment_method',
        'paid_at',
        'notes',
    ];

    protected $hidden = [
        'clinic_id',
        'deleted_at',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'amount_paid' => 'decimal:2',
    ];

    // ─────────────────────────────────────────────────────────────
    // BOOT
    // ─────────────────────────────────────────────────────────────

    protected static function booted(): void
    {
        // Clinic isolation
        static::addGlobalScope('clinic', function (Builder $builder) {
            if (auth()->user()?->clinic_id) {
                $builder->where('invoices.clinic_id', auth()->user()->clinic_id);
            }
        });

        // Auto-generate invoice number on create
        static::creating(function (Invoice $invoice) {
            $invoice->invoice_number ??= self::generateNumber($invoice->clinic_id);
            $invoice->clinic_id ??= auth()->user()?->clinic_id;
        });

        // Mark paid_at when status flips to paid
        static::updating(function (Invoice $invoice) {
            if ($invoice->isDirty('status') && $invoice->status === 'paid') {
                $invoice->paid_at ??= now();
            }
        });
    }

    // ─────────────────────────────────────────────────────────────
    // RELATIONSHIPS
    // ─────────────────────────────────────────────────────────────

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    // ─────────────────────────────────────────────────────────────
    // SCOPES
    // ─────────────────────────────────────────────────────────────

    public function scopePaid(Builder $query): Builder
    {
        return $query->where('status', 'paid');
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopeOverdue(Builder $query): Builder
    {
        return $query->where('status', 'pending')
            ->where('created_at', '<', now()->subDays(30));
    }

    // ─────────────────────────────────────────────────────────────
    // ACCESSORS
    // ─────────────────────────────────────────────────────────────

    public function getBalanceDueAttribute(): float
    {
        return round((float) $this->total - (float) $this->amount_paid, 2);
    }

    public function getIsFullyPaidAttribute(): bool
    {
        return $this->balance_due <= 0;
    }

    // ─────────────────────────────────────────────────────────────
    // BUSINESS LOGIC
    // ─────────────────────────────────────────────────────────────

    /**
     * Recalculate subtotal and total from line items.
     * Called automatically by InvoiceItem::saved() and InvoiceItem::deleted().
     */
    public function recalculateTotals(): void
    {
        $subtotal = $this->items()->sum('total');

        $this->updateQuietly([
            'subtotal' => $subtotal,
            'total' => round($subtotal - (float) $this->discount, 2),
        ]);
    }

    /**
     * Record a payment against this invoice.
     */
    public function recordPayment(float $amount, string $method): void
    {
        $newAmountPaid = round((float) $this->amount_paid + $amount, 2);

        $this->update([
            'amount_paid' => $newAmountPaid,
            'payment_method' => $method,
            'status' => $newAmountPaid >= (float) $this->total
                ? 'paid'
                : 'partial',
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────

    private static function generateNumber(int $clinicId): string
    {
        $count = self::withoutGlobalScopes()
            ->where('clinic_id', $clinicId)
            ->count() + 1;

        return 'INV-'.now()->format('Y').'-'.str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
