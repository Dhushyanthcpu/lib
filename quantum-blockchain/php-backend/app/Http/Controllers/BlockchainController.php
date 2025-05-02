<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Block;
use App\Models\Transaction;
use App\Services\BlockchainService;
use Illuminate\Support\Facades\Validator;

class BlockchainController extends Controller
{
    protected $blockchainService;
    
    public function __construct(BlockchainService $blockchainService)
    {
        $this->blockchainService = $blockchainService;
    }
    
    public function getHeight()
    {
        $height = $this->blockchainService->getCurrentBlockHeight();
        
        if ($height === null) {
            return response()->json(['error' => 'Failed to get blockchain height'], 500);
        }
        
        return response()->json(['height' => $height]);
    }
    
    public function getBlock($height)
    {
        // Try to get from database first
        $block = Block::with('transactions')->where('height', $height)->first();
        
        if ($block) {
            return response()->json($block);
        }
        
        // If not in database, fetch from blockchain
        $blockData = $this->blockchainService->getBlockByHeight($height);
        
        if (!$blockData) {
            return response()->json(['error' => 'Block not found'], 404);
        }
        
        return response()->json($blockData);
    }
    
    public function getTransaction($hash)
    {
        // Try to get from database first
        $transaction = Transaction::with('block')->where('hash', $hash)->first();
        
        if ($transaction) {
            return response()->json($transaction);
        }
        
        // If not in database, fetch from blockchain
        $transactionData = $this->blockchainService->getTransactionByHash($hash);
        
        if (!$transactionData) {
            return response()->json(['error' => 'Transaction not found'], 404);
        }
        
        return response()->json($transactionData);
    }
    
    public function submitTransaction(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fromAddress' => 'required|string',
            'toAddress' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'signature' => 'required|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }
        
        $transaction = [
            'fromAddress' => $request->fromAddress,
            'toAddress' => $request->toAddress,
            'amount' => $request->amount,
            'signature' => $request->signature,
            'timestamp' => now()->timestamp,
            'quantumSecure' => $request->quantumSecure ?? false,
        ];
        
        $result = $this->blockchainService->submitTransaction($transaction);
        
        if (!$result) {
            return response()->json(['error' => 'Failed to submit transaction'], 500);
        }
        
        return response()->json($result);
    }
    
    public function getBalance($address)
    {
        try {
            $response = \Http::get("{$this->blockchainService->apiUrl}/api/blockchain/balance/{$address}");
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
            
            return response()->json(['error' => 'Failed to get balance'], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error getting balance: ' . $e->getMessage()], 500);
        }
    }
    
    public function getDashboardData()
    {
        try {
            // Get latest blocks
            $latestBlocks = Block::with('transactions')
                ->orderBy('height', 'desc')
                ->limit(10)
                ->get();
            
            // Get latest transactions
            $latestTransactions = Transaction::with('block')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
            
            // Get blockchain stats
            $totalBlocks = Block::count();
            $totalTransactions = Transaction::count();
            $latestBlockHeight = Block::max('height');
            
            return response()->json([
                'latestBlocks' => $latestBlocks,
                'latestTransactions' => $latestTransactions,
                'stats' => [
                    'totalBlocks' => $totalBlocks,
                    'totalTransactions' => $totalTransactions,
                    'latestBlockHeight' => $latestBlockHeight,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error getting dashboard data: ' . $e->getMessage()], 500);
        }
    }
}
