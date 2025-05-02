<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Account extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'address',
        'balance',
        'public_key',
        'private_key',
        'user_id',
        'name',
        'is_primary',
        'type',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'private_key',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'balance' => 'decimal:8',
        'is_primary' => 'boolean',
    ];

    /**
     * Get the user that owns the account.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generate a new account.
     *
     * @param int|null $userId
     * @param string|null $name
     * @param bool $isPrimary
     * @param string $type
     * @return self
     */
    public static function generate(
        ?int $userId = null, 
        ?string $name = null, 
        bool $isPrimary = false,
        string $type = 'standard'
    ): self
    {
        // Generate a random address with KTR prefix
        $address = 'KTR' . bin2hex(random_bytes(30));
        
        // Create a new account
        return self::create([
            'address' => $address,
            'balance' => 100, // Initial balance
            'public_key' => bin2hex(random_bytes(32)),
            'private_key' => bin2hex(random_bytes(32)),
            'user_id' => $userId,
            'name' => $name ?? 'Account ' . substr($address, 0, 8),
            'is_primary' => $isPrimary,
            'type' => $type,
        ]);
    }
    
    /**
     * Get sent transactions.
     */
    public function sentTransactions()
    {
        return Transaction::where('sender', $this->address);
    }
    
    /**
     * Get received transactions.
     */
    public function receivedTransactions()
    {
        return Transaction::where('recipient', $this->address);
    }
}