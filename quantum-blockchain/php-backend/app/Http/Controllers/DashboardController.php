<?php

namespace App\Http\Controllers;

use App\Models\Block;
use App\Models\Transaction;
use App\Models\Account;
use App\Models\AIModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard summary data.
     *
     * @return JsonResponse
     */
    public function getSummary(): JsonResponse
    {
        // Get blockchain statistics
        $blockCount = Block::count();
        $transactionCount = Transaction::count();
        $pendingTransactionCount = Transaction::where('status', 'pending')->count();
        $accountCount = Account::count();
        $aiModelCount = AIModel::count();
        
        // Get latest block
        $latestBlock = Block::orderBy('index', 'desc')->first();
        
        // Get quantum-enhanced blocks percentage
        $quantumEnhancedCount = Block::where('quantum_enhanced', true)->count();
        $quantumPercentage = $blockCount > 0 ? ($quantumEnhancedCount / $blockCount) * 100 : 0;
        
        // Get transaction volume (last 24 hours)
        $last24HoursTransactions = Transaction::where('created_at', '>=', now()->subDay())
            ->sum('amount');
        
        return response()->json([
            'success' => true,
            'data' => [
                'block_count' => $blockCount,
                'transaction_count' => $transactionCount,
                'pending_transaction_count' => $pendingTransactionCount,
                'account_count' => $accountCount,
                'ai_model_count' => $aiModelCount,
                'latest_block' => $latestBlock,
                'quantum_enhanced_percentage' => round($quantumPercentage, 2),
                'transaction_volume_24h' => $last24HoursTransactions,
            ]
        ]);
    }
    
    /**
     * Get performance metrics for the dashboard.
     *
     * @return JsonResponse
     */
    public function getPerformance(): JsonResponse
    {
        // Calculate average block time
        $avgBlockTime = 0;
        $blockCount = Block::count();
        
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
        
        // Get transaction throughput (transactions per minute)
        $transactionsLastHour = Transaction::where('created_at', '>=', now()->subHour())->count();
        $throughput = $transactionsLastHour / 60;
        
        // Get mining difficulty trend
        $difficultyTrend = Block::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('AVG(difficulty) as avg_difficulty')
        )
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->take(7)
            ->get();
        
        // Get quantum vs. traditional performance comparison
        $quantumBlocks = Block::where('quantum_enhanced', true)->get();
        $traditionalBlocks = Block::where('quantum_enhanced', false)->get();
        
        $quantumAvgNonce = $quantumBlocks->avg('nonce') ?: 0;
        $traditionalAvgNonce = $traditionalBlocks->avg('nonce') ?: 0;
        
        $performanceImprovement = $traditionalAvgNonce > 0 ? 
            (($traditionalAvgNonce - $quantumAvgNonce) / $traditionalAvgNonce) * 100 : 0;
        
        return response()->json([
            'success' => true,
            'data' => [
                'avg_block_time' => round($avgBlockTime, 2),
                'transaction_throughput' => round($throughput, 2),
                'difficulty_trend' => $difficultyTrend,
                'quantum_avg_nonce' => round($quantumAvgNonce, 2),
                'traditional_avg_nonce' => round($traditionalAvgNonce, 2),
                'performance_improvement' => round($performanceImprovement, 2),
            ]
        ]);
    }
    
    /**
     * Get recent activity for the dashboard.
     *
     * @return JsonResponse
     */
    public function getRecentActivity(): JsonResponse
    {
        // Get recent blocks
        $recentBlocks = Block::with('transactions')
            ->orderBy('index', 'desc')
            ->take(5)
            ->get();
        
        // Get recent transactions
        $recentTransactions = Transaction::orderBy('created_at', 'desc')
            ->take(10)
            ->get();
        
        // Get recent AI model training activities
        $recentAIModels = AIModel::orderBy('created_at', 'desc')
            ->take(5)
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => [
                'recent_blocks' => $recentBlocks,
                'recent_transactions' => $recentTransactions,
                'recent_ai_models' => $recentAIModels,
            ]
        ]);
    }
    
    /**
     * Get market trends for the dashboard.
     *
     * @return JsonResponse
     */
    public function getMarketTrends(): JsonResponse
    {
        // Get transaction volume by day (last 7 days)
        $volumeByDay = Transaction::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(amount) as volume')
        )
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->take(7)
            ->get();
        
        // Get transaction count by day (last 7 days)
        $countByDay = Transaction::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->take(7)
            ->get();
        
        // Get active accounts by day (last 7 days)
        $activeAccountsByDay = Transaction::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(DISTINCT sender) as active_accounts')
        )
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->take(7)
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => [
                'volume_by_day' => $volumeByDay,
                'count_by_day' => $countByDay,
                'active_accounts_by_day' => $activeAccountsByDay,
            ]
        ]);
    }
    
    /**
     * Get quantum metrics for the dashboard.
     *
     * @return JsonResponse
     */
    public function getQuantumMetrics(): JsonResponse
    {
        // Get quantum-enhanced blocks
        $quantumBlocks = Block::where('quantum_enhanced', true)->get();
        $traditionalBlocks = Block::where('quantum_enhanced', false)->get();
        
        // Calculate mining speedup metrics
        $miningSpeedupRecent = [];
        $recentBlocks = Block::orderBy('index', 'desc')->take(10)->get();
        
        foreach ($recentBlocks as $block) {
            if ($block->quantum_enhanced) {
                // Calculate speedup factor based on difficulty and time
                // This is a simplified example - actual calculation would depend on your specific implementation
                $speedupFactor = $block->difficulty / max(1, $block->mining_time);
                $miningSpeedupRecent[] = $speedupFactor;
            }
        }
        
        $miningSpeedupMean = !empty($miningSpeedupRecent) ? array_sum($miningSpeedupRecent) / count($miningSpeedupRecent) : 0;
        
        // Calculate verification accuracy metrics
        $verificationAccuracyRecent = [];
        $recentTransactions = Transaction::orderBy('created_at', 'desc')->take(10)->get();
        
        foreach ($recentTransactions as $transaction) {
            // This is a simplified example - actual calculation would depend on your specific implementation
            // For example, you might compare quantum verification results with traditional verification
            $verificationAccuracy = $transaction->verification_success ? 1.0 : 0.8;
            $verificationAccuracyRecent[] = $verificationAccuracy;
        }
        
        $verificationAccuracyMean = !empty($verificationAccuracyRecent) ? array_sum($verificationAccuracyRecent) / count($verificationAccuracyRecent) : 0;
        
        // Calculate AI training efficiency metrics
        $aiTrainingEfficiencyRecent = [];
        $recentAIModels = AIModel::orderBy('created_at', 'desc')->take(5)->get();
        
        foreach ($recentAIModels as $model) {
            // This is a simplified example - actual calculation would depend on your specific implementation
            $efficiencyFactor = $model->quantum_enhanced ? rand(15, 25) / 10 : 1.0;
            $aiTrainingEfficiencyRecent[] = $efficiencyFactor;
        }
        
        $aiTrainingEfficiencyMean = !empty($aiTrainingEfficiencyRecent) ? array_sum($aiTrainingEfficiencyRecent) / count($aiTrainingEfficiencyRecent) : 0;
        
        // Calculate optimization quality metrics
        $optimizationQualityRecent = [];
        
        // This is a simplified example - actual calculation would depend on your specific implementation
        for ($i = 0; $i < 5; $i++) {
            $optimizationQuality = rand(12, 18) / 10;
            $optimizationQualityRecent[] = $optimizationQuality;
        }
        
        $optimizationQualityMean = !empty($optimizationQualityRecent) ? array_sum($optimizationQualityRecent) / count($optimizationQualityRecent) : 0;
        
        return response()->json([
            'success' => true,
            'data' => [
                'quantum_metrics' => [
                    'mining_speedup' => [
                        'recent' => $miningSpeedupRecent,
                        'mean' => $miningSpeedupMean
                    ],
                    'verification_accuracy' => [
                        'recent' => $verificationAccuracyRecent,
                        'mean' => $verificationAccuracyMean
                    ],
                    'ai_training_efficiency' => [
                        'recent' => $aiTrainingEfficiencyRecent,
                        'mean' => $aiTrainingEfficiencyMean
                    ],
                    'optimization_quality' => [
                        'recent' => $optimizationQualityRecent,
                        'mean' => $optimizationQualityMean
                    ]
                ]
            ]
        ]);
    }
}