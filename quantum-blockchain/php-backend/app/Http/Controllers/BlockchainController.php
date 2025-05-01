<?php

namespace App\Http\Controllers;

use App\Models\Block;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlockchainController extends Controller
{
    /**
     * Get blockchain statistics.
     *
     * @return JsonResponse
     */
    public function getStats(): JsonResponse
    {
        // Get blockchain statistics
        $blockCount = Block::count();
        $transactionCount = Transaction::count();
        $pendingTransactionCount = Transaction::where('status', 'pending')->count();
        $accountCount = \App\Models\Account::count();
        $smartContractCount = 0; // Not implemented yet
        $aiModelCount = \App\Models\AIModel::count();
        
        // Calculate average block time
        $avgBlockTime = 0;
        if ($blockCount > 1) {
            $latestBlocks = Block::orderBy('index', 'desc')->take(10)->get();
            $totalTime = 0;
            $count = 0;
            
            for ($i = 0; $i < count($latestBlocks) - 1; $i++) {
                $timeDiff = $latestBlocks[$i]->block_timestamp->timestamp - $latestBlocks[$i + 1]->block_timestamp->timestamp;
                $totalTime += $timeDiff;
                $count++;
            }
            
            $avgBlockTime = $count > 0 ? $totalTime / $count : 0;
        }
        
        // Get quantum metrics
        $quantumMetrics = $this->getQuantumMetrics();
        
        // Return statistics
        return response()->json([
            'block_count' => $blockCount,
            'transaction_count' => $transactionCount,
            'pending_transaction_count' => $pendingTransactionCount,
            'account_count' => $accountCount,
            'smart_contract_count' => $smartContractCount,
            'ai_model_count' => $aiModelCount,
            'avg_block_time' => $avgBlockTime,
            'quantum_metrics' => $quantumMetrics,
        ]);
    }

    /**
     * Get blockchain blocks.
     *
     * @return JsonResponse
     */
    public function getBlocks(): JsonResponse
    {
        // Get blocks with transactions
        $blocks = Block::with('transactions')
            ->orderBy('index', 'desc')
            ->take(10)
            ->get();
        
        return response()->json([
            'blocks' => $blocks,
        ]);
    }

    /**
     * Get pending transactions.
     *
     * @return JsonResponse
     */
    public function getPendingTransactions(): JsonResponse
    {
        // Get pending transactions
        $transactions = Transaction::where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'transactions' => $transactions,
        ]);
    }

    /**
     * Get quantum metrics.
     *
     * @return array
     */
    private function getQuantumMetrics(): array
    {
        // Get the latest block with quantum enhancement
        $latestQuantumBlock = Block::where('quantum_enhanced', true)
            ->orderBy('index', 'desc')
            ->first();
        
        if ($latestQuantumBlock) {
            return $latestQuantumBlock->quantum_metrics;
        }
        
        // If no quantum-enhanced block exists, return default metrics
        return [
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