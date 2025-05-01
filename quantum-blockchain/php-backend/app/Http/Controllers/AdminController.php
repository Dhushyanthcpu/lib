<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\AIModel;
use App\Models\Block;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\View\View;

class AdminController extends Controller
{
    /**
     * Show the admin dashboard.
     *
     * @return View
     */
    public function dashboard(): View
    {
        // Get blockchain statistics
        $blockCount = Block::count();
        $transactionCount = Transaction::count();
        $pendingTransactionCount = Transaction::where('status', 'pending')->count();
        $accountCount = Account::count();
        $aiModelCount = AIModel::count();
        
        // Get latest blocks
        $latestBlocks = Block::with('transactions')
            ->orderBy('index', 'desc')
            ->take(5)
            ->get();
        
        // Get pending transactions
        $pendingTransactions = Transaction::where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
        
        // Get accounts
        $accounts = Account::orderBy('created_at', 'desc')
            ->take(5)
            ->get();
        
        return view('admin.dashboard', [
            'blockCount' => $blockCount,
            'transactionCount' => $transactionCount,
            'pendingTransactionCount' => $pendingTransactionCount,
            'accountCount' => $accountCount,
            'aiModelCount' => $aiModelCount,
            'latestBlocks' => $latestBlocks,
            'pendingTransactions' => $pendingTransactions,
            'accounts' => $accounts,
        ]);
    }

    /**
     * Show the blocks page.
     *
     * @return View
     */
    public function blocks(): View
    {
        // Get all blocks
        $blocks = Block::with('transactions')
            ->orderBy('index', 'desc')
            ->paginate(10);
        
        return view('admin.blocks', [
            'blocks' => $blocks,
        ]);
    }

    /**
     * Show the transactions page.
     *
     * @return View
     */
    public function transactions(): View
    {
        // Get all transactions
        $transactions = Transaction::with('block')
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        
        return view('admin.transactions', [
            'transactions' => $transactions,
        ]);
    }

    /**
     * Show the accounts page.
     *
     * @return View
     */
    public function accounts(): View
    {
        // Get all accounts
        $accounts = Account::orderBy('created_at', 'desc')
            ->paginate(10);
        
        return view('admin.accounts', [
            'accounts' => $accounts,
        ]);
    }

    /**
     * Show the AI models page.
     *
     * @return View
     */
    public function aiModels(): View
    {
        // Get all AI models
        $aiModels = AIModel::orderBy('created_at', 'desc')
            ->paginate(10);
        
        return view('admin.ai-models', [
            'aiModels' => $aiModels,
        ]);
    }
}