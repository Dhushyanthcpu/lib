<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
    ];

    /**
     * Generate a new account.
     *
     * @return self
     */
    public static function generate(): self
    {
        // Generate a random address with KTR prefix
        $address = 'KTR' . bin2hex(random_bytes(30));
        
        // Create a new account
        return self::create([
            'address' => $address,
            'balance' => 100, // Initial balance
            'public_key' => bin2hex(random_bytes(32)),
            'private_key' => bin2hex(random_bytes(32)),
        ]);
    }
}