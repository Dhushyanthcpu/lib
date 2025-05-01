<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Block;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MiningController extends Controller
{
    /**
     * Mine a new block.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function mineBlock(Request $request): JsonResponse
    {
        // Validate request
        $request->validate([
            'miner_address' => 'required|string',
        ]);
        
        // Check if miner exists
        $miner = Account::where('address', $request->miner_address)->first();
        
        if (!$miner) {
            return response()->json([
                'error' => 'Miner account not found',
            ], 404);
        }
        
        // Get pending transactions
        $pendingTransactions = Transaction::where('status', 'pending')
            ->orderBy('created_at', 'asc')
            ->take(10)
            ->get();
        
        // Get the latest block
        $latestBlock = Block::orderBy('index', 'desc')->first();
        
        // Create a new block
        $newBlock = new Block([
            'index' => $latestBlock ? $latestBlock->index + 1 : 0,
            'block_timestamp' => now(),
            'previous_hash' => $latestBlock ? $latestBlock->hash : str_repeat('0', 64),
            'nonce' => 0,
            'difficulty' => env('QUANTUM_MINING_DIFFICULTY', 4),
        ]);
        
        // Mine the block
        $newBlock->mine(env('QUANTUM_MINING_DIFFICULTY', 4));
        
        // Apply quantum enhancement
        $newBlock->applyQuantumEnhancement();
        
        // Save the block
        $newBlock->save();
        
        // Process transactions
        foreach ($pendingTransactions as $transaction) {
            // Update transaction status and block ID
            $transaction->status = 'confirmed';
            $transaction->block_id = $newBlock->id;
            $transaction->save();
            
            // Process the transaction
            $transaction->process();
        }
        
        // Reward the miner
        $minerReward = env('QUANTUM_BLOCK_REWARD', 50);
        $miner->balance += $minerReward;
        $miner->save();
        
        // Create reward transaction
        $rewardTransaction = new Transaction([
            'sender' => 'SYSTEM',
            'recipient' => $request->miner_address,
            'amount' => $minerReward,
            'transaction_timestamp' => now(),
            'type' => 'reward',
            'data' => ['block_index' => $newBlock->index],
            'status' => 'confirmed',
            'block_id' => $newBlock->id,
        ]);
        
        // Calculate hash
        $rewardTransaction->hash = $rewardTransaction->calculateHash();
        
        // Save reward transaction
        $rewardTransaction->save();
        
        // Return the new block with transactions
        return response()->json([
            'block' => $newBlock->load('transactions'),
            'miner_reward' => $minerReward,
        ]);
    }
}