<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'hash',
        'sender',
        'recipient',
        'amount',
        'transaction_timestamp',
        'type',
        'data',
        'status',
        'block_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'transaction_timestamp' => 'datetime',
        'amount' => 'decimal:8',
        'data' => 'array',
    ];

    /**
     * Get the block that owns the transaction.
     */
    public function block(): BelongsTo
    {
        return $this->belongsTo(Block::class);
    }

    /**
     * Calculate the hash of the transaction.
     *
     * @return string
     */
    public function calculateHash(): string
    {
        $data = $this->sender . 
                $this->recipient . 
                $this->amount . 
                $this->transaction_timestamp->timestamp . 
                $this->type . 
                json_encode($this->data);
        
        return hash('sha256', $data);
    }

    /**
     * Process the transaction.
     *
     * @return bool
     */
    public function process(): bool
    {
        // Get sender and recipient accounts
        $sender = Account::where('address', $this->sender)->first();
        $recipient = Account::where('address', $this->recipient)->first();
        
        // Check if sender has enough balance
        if ($sender && $sender->balance >= $this->amount) {
            // Update balances
            $sender->balance -= $this->amount;
            $recipient->balance += $this->amount;
            
            // Save changes
            $sender->save();
            $recipient->save();
            
            // Update transaction status
            $this->status = 'confirmed';
            $this->save();
            
            return true;
        }
        
        // Transaction failed
        $this->status = 'failed';
        $this->save();
        
        return false;
    }
}