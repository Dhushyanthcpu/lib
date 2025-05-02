<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use App\Models\Block;
use Carbon\Carbon;

class BlockchainCleanup extends Command
{
    protected $signature = 'blockchain:cleanup 
                            {--older-than=30 : Delete blocks older than N days}
                            {--keep-latest=1000 : Always keep the latest N blocks}';

    protected $description = 'Clean up old blockchain data from the database';

    public function handle()
    {
        $this->info('Starting blockchain data cleanup...');
        
        try {
            $olderThan = (int)$this->option('older-than');
            $keepLatest = (int)$this->option('keep-latest');
            
            $this->info("Cleaning up blocks older than $olderThan days, keeping at least $keepLatest latest blocks");
            
            // Get the cutoff date
            $cutoffDate = Carbon::now()->subDays($olderThan);
            
            // Get the latest block height to ensure we keep the latest N blocks
            $latestBlockHeight = Block::max('height');
            $minHeightToKeep = max(1, $latestBlockHeight - $keepLatest + 1);
            
            // Find blocks to delete
            $blocksToDelete = Block::where('timestamp', '<', $cutoffDate)
                ->where('height', '<', $minHeightToKeep)
                ->get();
            
            $count = $blocksToDelete->count();
            
            if ($count === 0) {
                $this->info("No blocks to delete");
                return 0;
            }
            
            $this->info("Found $count blocks to delete");
            
            $bar = $this->output->createProgressBar($count);
            $bar->start();
            
            // Delete blocks (transactions will be deleted via cascade)
            foreach ($blocksToDelete as $block) {
                $block->delete();
                $bar->advance();
            }
            
            $bar->finish();
            $this->newLine();
            $this->info("Blockchain cleanup completed: $count blocks deleted");
            
            return 0;
        } catch (\Exception $e) {
            Log::error("Blockchain cleanup failed: " . $e->getMessage());
            $this->error("Blockchain cleanup failed: " . $e->getMessage());
            return 1;
        }
    }
}
