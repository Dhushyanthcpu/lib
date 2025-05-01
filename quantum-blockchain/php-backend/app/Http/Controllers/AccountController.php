<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    /**
     * Get account balance.
     *
     * @param string $address
     * @return JsonResponse
     */
    public function getBalance(string $address): JsonResponse
    {
        // Find account by address
        $account = Account::where('address', $address)->first();
        
        if (!$account) {
            return response()->json([
                'error' => 'Account not found',
            ], 404);
        }
        
        return response()->json([
            'address' => $account->address,
            'balance' => $account->balance,
        ]);
    }

    /**
     * Create a new account.
     *
     * @return JsonResponse
     */
    public function create(): JsonResponse
    {
        // Generate a new account
        $account = Account::generate();
        
        return response()->json([
            'address' => $account->address,
            'balance' => $account->balance,
        ]);
    }

    /**
     * Get all accounts.
     *
     * @return JsonResponse
     */
    public function getAll(): JsonResponse
    {
        // Get all accounts
        $accounts = Account::all(['address', 'balance']);
        
        return response()->json([
            'accounts' => $accounts,
        ]);
    }
}