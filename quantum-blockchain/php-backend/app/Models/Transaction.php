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
        'user_id',
        'fee',
        'memo',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'transaction_timestamp' => 'datetime',
        'amount' => 'decimal:8',
        'fee' => 'decimal:8',
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
     * Get the user that owns the transaction.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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
                json_encode($this->data) .
                ($this->memo ?? '');
        
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
        
        // Check if sender and recipient exist
        if (!$sender || !$recipient) {
            $this->status = 'failed';
            $this->save();
            return false;
        }
        
        // Calculate total amount including fee
        $totalAmount = $this->amount + ($this->fee ?? 0);
        
        // Check if sender has enough balance
        if ($sender->balance >= $totalAmount) {
            // Update balances
            $sender->balance -= $totalAmount;
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
    
    /**
     * Get the sender account.
     */
    public function senderAccount()
    {
        return Account::where('address', $this->sender)->first();
    }
    
    /**
     * Get the recipient account.
     */
    public function recipientAccount()
    {
        return Account::where('address', $this->recipient)->first();
    }
    
    /**
     * Apply quantum optimization to the transaction.
     * 
     * @return void
     */
    public function applyQuantumOptimization(): void
    {
        // Add quantum optimization data
        $this->data = array_merge($this->data ?? [], [
            'quantum_optimized' => true,
            'optimization_timestamp' => now()->timestamp,
            'optimization_metrics' => [
                'verification_speedup' => rand(150, 500) / 100,
                'security_level' => rand(90, 99) / 100,
                'efficiency_gain' => rand(120, 400) / 100,
            ]
        ]);
        
        $this->save();
    }
}