<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * Create a new transaction.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function create(Request $request): JsonResponse
    {
        // Validate request
        $request->validate([
            'sender' => 'required|string',
            'recipient' => 'required|string',
            'amount' => 'required|numeric|min:0.00000001',
            'transaction_type' => 'nullable|string',
            'data' => 'nullable|array',
        ]);
        
        // Check if sender and recipient exist
        $sender = Account::where('address', $request->sender)->first();
        $recipient = Account::where('address', $request->recipient)->first();
        
        if (!$sender) {
            return response()->json([
                'error' => 'Sender account not found',
            ], 404);
        }
        
        if (!$recipient) {
            return response()->json([
                'error' => 'Recipient account not found',
            ], 404);
        }
        
        // Check if sender has enough balance
        if ($sender->balance < $request->amount) {
            return response()->json([
                'error' => 'Insufficient balance',
            ], 400);
        }
        
        // Create transaction
        $transaction = new Transaction([
            'sender' => $request->sender,
            'recipient' => $request->recipient,
            'amount' => $request->amount,
            'transaction_timestamp' => now(),
            'type' => $request->transaction_type ?? 'transfer',
            'data' => $request->data ?? [],
            'status' => 'pending',
        ]);
        
        // Calculate hash
        $transaction->hash = $transaction->calculateHash();
        
        // Save transaction
        $transaction->save();
        
        return response()->json($transaction);
    }

    /**
     * Get transaction by hash.
     *
     * @param string $hash
     * @return JsonResponse
     */
    public function getByHash(string $hash): JsonResponse
    {
        // Find transaction by hash
        $transaction = Transaction::where('hash', $hash)->first();
        
        if (!$transaction) {
            return response()->json([
                'error' => 'Transaction not found',
            ], 404);
        }
        
        return response()->json($transaction);
    }
}