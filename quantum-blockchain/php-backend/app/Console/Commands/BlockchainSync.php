<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use App\Models\Block;
use App\Models\Transaction;
use App\Services\BlockchainService;

class BlockchainSync extends Command
{
    protected $signature = 'blockchain:sync 
                            {--latest= : Sync only the latest N blocks}
                            {--start= : Start block number}
                            {--end= : End block number}
                            {--force : Force sync even if blocks exist}';

    protected $description = 'Synchronize blockchain data with the database';

    protected $blockchainService;

    public function __construct(BlockchainService $blockchainService)
    {
        parent::__construct();
        $this->blockchainService = $blockchainService;
    }

    public function handle()
    {
        $this->info('Starting blockchain synchronization...');
        
        try {
            // Determine sync range
            $latest = $this->option('latest');
            $start = $this->option('start');
            $end = $this->option('end');
            $force = $this->option('force');
            
            if ($latest) {
                $currentHeight = $this->blockchainService->getCurrentBlockHeight();
                $start = max(1, $currentHeight - intval($latest) + 1);
                $end = $currentHeight;
                $this->info("Syncing latest $latest blocks from $start to $end");
            } elseif ($start && $end) {
                $this->info("Syncing blocks from $start to $end");
            } else {
                $lastBlock = Block::orderBy('height', 'desc')->first();
                $start = $lastBlock ? $lastBlock->height + 1 : 1;
                $end = $this->blockchainService->getCurrentBlockHeight();
                $this->info("Syncing blocks from $start to $end");
            }
            
            $totalBlocks = $end - $start + 1;
            $bar = $this->output->createProgressBar($totalBlocks);
            $bar->start();
            
            $syncedBlocks = 0;
            $syncedTransactions = 0;
            
            for ($height = $start; $height <= $end; $height++) {
                $existingBlock = Block::where('height', $height)->first();
                
                if ($existingBlock && !$force) {
                    $bar->advance();
                    continue;
                }
                
                $blockData = $this->blockchainService->getBlockByHeight($height);
                
                if (!$blockData) {
                    $this->warn("Block $height not found");
                    $bar->advance();
                    continue;
                }
                
                // Begin transaction for data integrity
                \Illuminate\Support\Facades\DB::beginTransaction();
                
                try {
                    // Delete existing block if force option is used
                    if ($existingBlock && $force) {
                        $existingBlock->transactions()->delete();
                        $existingBlock->delete();
                    }
                    
                    // Create new block
                    $block = Block::create([
                        'height' => $height,
                        'hash' => $blockData['hash'],
                        'previous_hash' => $blockData['previousHash'],
                        'timestamp' => $blockData['timestamp'],
                        'difficulty' => $blockData['difficulty'],
                        'nonce' => $blockData['nonce'],
                        'size' => $blockData['size'] ?? 0,
                        'quantum_signature' => $blockData['quantumSignature'] ?? null,
                    ]);
                    
                    // Process transactions
                    foreach ($blockData['transactions'] as $txData) {
                        Transaction::create([
                            'block_id' => $block->id,
                            'hash' => $txData['hash'],
                            'from_address' => $txData['fromAddress'],
                            'to_address' => $txData['toAddress'],
                            'amount' => $txData['amount'],
                            'fee' => $txData['fee'] ?? 0,
                            'signature' => $txData['signature'],
                            'timestamp' => $txData['timestamp'],
                            'quantum_secure' => $txData['quantumSecure'] ?? false,
                        ]);
                        
                        $syncedTransactions++;
                    }
                    
                    \Illuminate\Support\Facades\DB::commit();
                    $syncedBlocks++;
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\DB::rollBack();
                    Log::error("Error syncing block $height: " . $e->getMessage());
                    $this->error("Error syncing block $height: " . $e->getMessage());
                }
                
                $bar->advance();
            }
            
            $bar->finish();
            $this->newLine();
            $this->info("Blockchain sync completed: $syncedBlocks blocks and $syncedTransactions transactions synchronized");
            
            return 0;
        } catch (\Exception $e) {
            Log::error("Blockchain sync failed: " . $e->getMessage());
            $this->error("Blockchain sync failed: " . $e->getMessage());
            return 1;
        }
    }
}

