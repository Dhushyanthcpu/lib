<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
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
                'success' => false,
                'message' => 'Sender account not found',
            ], 404);
        }
        
        if (!$recipient) {
            return response()->json([
                'success' => false,
                'message' => 'Recipient account not found',
            ], 404);
        }
        
        // Check if sender has enough balance
        if ($sender->balance < $request->amount) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient balance',
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
        
        // Associate with user if authenticated
        if ($request->user()) {
            $transaction->user_id = $request->user()->id;
        }
        
        // Save transaction
        $transaction->save();
        
        // Update account balances (optimistic approach)
        $sender->balance -= $request->amount;
        $recipient->balance += $request->amount;
        
        $sender->save();
        $recipient->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Transaction created successfully',
            'data' => $transaction
        ]);
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
                'success' => false,
                'message' => 'Transaction not found',
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $transaction
        ]);
    }
    
    /**
     * Get transactions by user.
     *
     * @param int $userId
     * @return JsonResponse
     */
    public function getByUser(int $userId): JsonResponse
    {
        // Check if user exists
        $user = User::find($userId);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }
        
        // Get user's accounts
        $accounts = Account::where('user_id', $userId)->pluck('address')->toArray();
        
        // Get transactions where user is sender or recipient
        $transactions = Transaction::where(function($query) use ($accounts) {
                $query->whereIn('sender', $accounts)
                    ->orWhereIn('recipient', $accounts);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        
        return response()->json([
            'success' => true,
            'data' => $transactions
        ]);
    }
    
    /**
     * Get all transactions.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getAll(Request $request): JsonResponse
    {
        // Validate request
        $request->validate([
            'status' => 'nullable|string|in:pending,confirmed,failed',
            'type' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);
        
        // Build query
        $query = Transaction::query();
        
        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->has('start_date')) {
            $query->where('created_at', '>=', $request->start_date);
        }
        
        if ($request->has('end_date')) {
            $query->where('created_at', '<=', $request->end_date);
        }
        
        if ($request->has('min_amount')) {
            $query->where('amount', '>=', $request->min_amount);
        }
        
        if ($request->has('max_amount')) {
            $query->where('amount', '<=', $request->max_amount);
        }
        
        // Get transactions
        $perPage = $request->input('per_page', 20);
        $transactions = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $transactions
        ]);
    }
}