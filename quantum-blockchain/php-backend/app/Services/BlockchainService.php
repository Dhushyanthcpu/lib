<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BlockchainService
{
    public $apiUrl;
    
    public function __construct()
    {
        // Set default API URL if environment variable is not set
        $this->apiUrl = env('BLOCKCHAIN_API_URL', 'http://localhost:8001');
    }
    
    /**
     * Get the current blockchain height
     */
    public function getCurrentBlockHeight()
    {
        try {
            $response = Http::get("{$this->apiUrl}/api/blockchain/height");
            
            if ($response->successful()) {
                return $response->json('height');
            }
            
            Log::error("Failed to get blockchain height: " . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error("Error getting blockchain height: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Get block data by height
     */
    public function getBlockByHeight($height)
    {
        try {
            $response = Http::get("{$this->apiUrl}/api/blockchain/block/{$height}");
            
            if ($response->successful()) {
                return $response->json();
            }
            
            Log::error("Failed to get block at height {$height}: " . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error("Error getting block at height {$height}: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Get transaction by hash
     */
    public function getTransactionByHash($hash)
    {
        try {
            $response = Http::get("{$this->apiUrl}/api/blockchain/transaction/{$hash}");
            
            if ($response->successful()) {
                return $response->json();
            }
            
            Log::error("Failed to get transaction {$hash}: " . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error("Error getting transaction {$hash}: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Submit a new transaction to the blockchain
     */
    public function submitTransaction($transaction)
    {
        try {
            $response = Http::post("{$this->apiUrl}/api/blockchain/transaction", $transaction);
            
            if ($response->successful()) {
                return $response->json();
            }
            
            Log::error("Failed to submit transaction: " . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error("Error submitting transaction: " . $e->getMessage());
            return null;
        }
    }
}


