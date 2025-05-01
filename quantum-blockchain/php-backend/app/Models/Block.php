<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Block extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'index',
        'block_timestamp',
        'previous_hash',
        'hash',
        'nonce',
        'difficulty',
        'quantum_enhanced',
        'quantum_metrics',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'block_timestamp' => 'datetime',
        'quantum_enhanced' => 'boolean',
        'quantum_metrics' => 'array',
    ];

    /**
     * Get the transactions for the block.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Calculate the hash of the block.
     *
     * @return string
     */
    public function calculateHash(): string
    {
        $data = $this->index . 
                $this->block_timestamp->timestamp . 
                $this->previous_hash . 
                $this->nonce . 
                $this->difficulty;
        
        // Add transaction hashes to the data
        foreach ($this->transactions as $transaction) {
            $data .= $transaction->hash;
        }
        
        return hash('sha256', $data);
    }

    /**
     * Mine the block with the given difficulty.
     *
     * @param int $difficulty
     * @return void
     */
    public function mine(int $difficulty): void
    {
        $this->difficulty = $difficulty;
        $this->nonce = 0;
        
        $target = str_repeat('0', $difficulty);
        
        while (substr($this->calculateHash(), 0, $difficulty) !== $target) {
            $this->nonce++;
            $this->hash = $this->calculateHash();
        }
        
        $this->hash = $this->calculateHash();
    }

    /**
     * Apply quantum enhancement to the block.
     *
     * @return void
     */
    public function applyQuantumEnhancement(): void
    {
        $this->quantum_enhanced = true;
        
        // Simulate quantum metrics
        $this->quantum_metrics = [
            'mining_speedup' => [
                'recent' => $this->generateRandomArray(10, 1.5, 5.0),
                'mean' => rand(20, 40) / 10,
            ],
            'verification_accuracy' => [
                'recent' => $this->generateRandomArray(10, 0.9, 0.99),
                'mean' => rand(90, 99) / 100,
            ],
            'ai_training_efficiency' => [
                'recent' => $this->generateRandomArray(10, 2.0, 8.0),
                'mean' => rand(30, 70) / 10,
            ],
            'optimization_quality' => [
                'recent' => $this->generateRandomArray(10, 1.2, 4.0),
                'mean' => rand(15, 35) / 10,
            ],
        ];
    }

    /**
     * Generate a random array of values.
     *
     * @param int $count
     * @param float $min
     * @param float $max
     * @return array
     */
    private function generateRandomArray(int $count, float $min, float $max): array
    {
        $result = [];
        
        for ($i = 0; $i < $count; $i++) {
            $result[] = $min + mt_rand() / mt_getrandmax() * ($max - $min);
        }
        
        return $result;
    }
}