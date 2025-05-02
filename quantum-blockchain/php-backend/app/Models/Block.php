<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Block extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'height',
        'hash',
        'previous_hash',
        'timestamp',
        'difficulty',
        'nonce',
        'size',
        'quantum_signature',
    ];
    
    protected $casts = [
        'height' => 'integer',
        'timestamp' => 'datetime',
        'difficulty' => 'integer',
        'nonce' => 'integer',
        'size' => 'integer',
    ];
    
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
