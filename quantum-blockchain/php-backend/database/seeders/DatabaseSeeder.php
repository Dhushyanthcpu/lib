<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\AIModel;
use App\Models\Block;
use App\Models\Transaction;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create genesis block
        $genesisBlock = Block::create([
            'index' => 0,
            'block_timestamp' => now()->subDays(30),
            'previous_hash' => str_repeat('0', 64),
            'hash' => hash('sha256', '0' . now()->subDays(30)->timestamp . str_repeat('0', 64) . '0' . '4'),
            'nonce' => 0,
            'difficulty' => 4,
            'quantum_enhanced' => true,
            'quantum_metrics' => [
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
            ],
        ]);
        
        // Create initial accounts
        $accounts = [];
        for ($i = 1; $i <= 5; $i++) {
            $accounts[] = Account::create([
                'address' => 'KTR' . $i . str_repeat('0', 31 - strlen((string)$i)),
                'balance' => 1000,
                'public_key' => bin2hex(random_bytes(32)),
                'private_key' => bin2hex(random_bytes(32)),
            ]);
        }
        
        // Create blocks and transactions
        $previousBlock = $genesisBlock;
        for ($i = 1; $i <= 10; $i++) {
            // Create block
            $block = Block::create([
                'index' => $i,
                'block_timestamp' => now()->subDays(30 - $i * 3),
                'previous_hash' => $previousBlock->hash,
                'hash' => hash('sha256', $i . now()->subDays(30 - $i * 3)->timestamp . $previousBlock->hash . rand(1000, 9999) . '4'),
                'nonce' => rand(1000, 9999),
                'difficulty' => 4,
                'quantum_enhanced' => $i % 2 === 0, // Every other block is quantum enhanced
                'quantum_metrics' => $i % 2 === 0 ? [
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
                ] : null,
            ]);
            
            // Create transactions for the block
            for ($j = 0; $j < 5; $j++) {
                $sender = $accounts[array_rand($accounts)];
                $recipient = $accounts[array_rand($accounts)];
                
                // Skip if sender and recipient are the same
                if ($sender->id === $recipient->id) {
                    continue;
                }
                
                $amount = rand(1, 100);
                
                // Create transaction
                $transaction = Transaction::create([
                    'sender' => $sender->address,
                    'recipient' => $recipient->address,
                    'amount' => $amount,
                    'transaction_timestamp' => now()->subDays(30 - $i * 3)->addMinutes($j * 10),
                    'type' => 'transfer',
                    'data' => ['note' => 'Transaction ' . $j . ' in block ' . $i],
                    'status' => 'confirmed',
                    'block_id' => $block->id,
                ]);
                
                // Calculate hash
                $transaction->hash = $transaction->calculateHash();
                $transaction->save();
                
                // Update balances
                $sender->balance -= $amount;
                $recipient->balance += $amount;
                $sender->save();
                $recipient->save();
            }
            
            $previousBlock = $block;
        }
        
        // Create pending transactions
        for ($i = 0; $i < 3; $i++) {
            $sender = $accounts[array_rand($accounts)];
            $recipient = $accounts[array_rand($accounts)];
            
            // Skip if sender and recipient are the same
            if ($sender->id === $recipient->id) {
                continue;
            }
            
            $amount = rand(1, 100);
            
            // Create transaction
            $transaction = Transaction::create([
                'sender' => $sender->address,
                'recipient' => $recipient->address,
                'amount' => $amount,
                'transaction_timestamp' => now()->subMinutes($i * 5),
                'type' => 'transfer',
                'data' => ['note' => 'Pending transaction ' . $i],
                'status' => 'pending',
            ]);
            
            // Calculate hash
            $transaction->hash = $transaction->calculateHash();
            $transaction->save();
        }
        
        // Create AI models
        for ($i = 0; $i < 3; $i++) {
            $owner = $accounts[array_rand($accounts)];
            
            AIModel::create([
                'model_id' => 'quantum_ai_model_' . bin2hex(random_bytes(10)),
                'owner' => $owner->address,
                'config' => [
                    'num_qubits' => rand(4, 16),
                    'layers' => rand(1, 4),
                ],
                'training_result' => [
                    'final_accuracy' => 0.85 + (mt_rand() / mt_getrandmax() * 0.14),
                    'final_loss' => 0.01 + (mt_rand() / mt_getrandmax() * 0.14),
                    'training_time' => 1 + (mt_rand() / mt_getrandmax() * 10),
                ],
            ]);
        }
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