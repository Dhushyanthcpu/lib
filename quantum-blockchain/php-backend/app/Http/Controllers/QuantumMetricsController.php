<?php

namespace App\Http\Controllers;

use App\Models\Block;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuantumMetricsController extends Controller
{
    /**
     * Get quantum metrics overview.
     *
     * @return JsonResponse
     */
    public function getOverview(): JsonResponse
    {
        // Get the latest block with quantum enhancement
        $latestQuantumBlock = Block::where('quantum_enhanced', true)
            ->orderBy('index', 'desc')
            ->first();
        
        // Get quantum-enhanced blocks percentage
        $totalBlocks = Block::count();
        $quantumEnhancedCount = Block::where('quantum_enhanced', true)->count();
        $quantumPercentage = $totalBlocks > 0 ? ($quantumEnhancedCount / $totalBlocks) * 100 : 0;
        
        // Get quantum metrics
        $quantumMetrics = $latestQuantumBlock ? $latestQuantumBlock->quantum_metrics : $this->getDefaultQuantumMetrics();
        
        return response()->json([
            'success' => true,
            'data' => [
                'quantum_enhanced_count' => $quantumEnhancedCount,
                'total_blocks' => $totalBlocks,
                'quantum_percentage' => round($quantumPercentage, 2),
                'latest_quantum_metrics' => $quantumMetrics,
            ]
        ]);
    }
    
    /**
     * Get quantum performance metrics.
     *
     * @return JsonResponse
     */
    public function getPerformance(): JsonResponse
    {
        // Get quantum vs. traditional mining performance
        $quantumBlocks = Block::where('quantum_enhanced', true)->get();
        $traditionalBlocks = Block::where('quantum_enhanced', false)->get();
        
        $quantumAvgNonce = $quantumBlocks->avg('nonce') ?: 0;
        $traditionalAvgNonce = $traditionalBlocks->avg('nonce') ?: 0;
        
        $miningSpeedup = $traditionalAvgNonce > 0 ? 
            $traditionalAvgNonce / $quantumAvgNonce : 0;
        
        // Get quantum mining efficiency over time
        $efficiencyTrend = Block::where('quantum_enhanced', true)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('AVG(nonce) as avg_nonce')
            )
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->take(7)
            ->get();
        
        // Calculate efficiency improvement
        $efficiencyImprovement = [];
        foreach ($efficiencyTrend as $index => $day) {
            if ($index < count($efficiencyTrend) - 1) {
                $currentNonce = $day->avg_nonce;
                $previousNonce = $efficiencyTrend[$index + 1]->avg_nonce;
                
                $improvement = $previousNonce > 0 ? 
                    (($previousNonce - $currentNonce) / $previousNonce) * 100 : 0;
                
                $efficiencyImprovement[] = [
                    'date' => $day->date,
                    'improvement' => round($improvement, 2),
                ];
            }
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'quantum_avg_nonce' => round($quantumAvgNonce, 2),
                'traditional_avg_nonce' => round($traditionalAvgNonce, 2),
                'mining_speedup' => round($miningSpeedup, 2),
                'efficiency_trend' => $efficiencyTrend,
                'efficiency_improvement' => $efficiencyImprovement,
            ]
        ]);
    }
    
    /**
     * Get quantum efficiency metrics.
     *
     * @return JsonResponse
     */
    public function getEfficiency(): JsonResponse
    {
        // Get the latest quantum-enhanced blocks
        $latestQuantumBlocks = Block::where('quantum_enhanced', true)
            ->orderBy('index', 'desc')
            ->take(10)
            ->get();
        
        // Extract efficiency metrics
        $miningSpeedups = [];
        $verificationAccuracies = [];
        $aiTrainingEfficiencies = [];
        $optimizationQualities = [];
        
        foreach ($latestQuantumBlocks as $block) {
            if (isset($block->quantum_metrics['mining_speedup']['mean'])) {
                $miningSpeedups[] = [
                    'block_index' => $block->index,
                    'value' => $block->quantum_metrics['mining_speedup']['mean'],
                ];
            }
            
            if (isset($block->quantum_metrics['verification_accuracy']['mean'])) {
                $verificationAccuracies[] = [
                    'block_index' => $block->index,
                    'value' => $block->quantum_metrics['verification_accuracy']['mean'],
                ];
            }
            
            if (isset($block->quantum_metrics['ai_training_efficiency']['mean'])) {
                $aiTrainingEfficiencies[] = [
                    'block_index' => $block->index,
                    'value' => $block->quantum_metrics['ai_training_efficiency']['mean'],
                ];
            }
            
            if (isset($block->quantum_metrics['optimization_quality']['mean'])) {
                $optimizationQualities[] = [
                    'block_index' => $block->index,
                    'value' => $block->quantum_metrics['optimization_quality']['mean'],
                ];
            }
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'mining_speedups' => $miningSpeedups,
                'verification_accuracies' => $verificationAccuracies,
                'ai_training_efficiencies' => $aiTrainingEfficiencies,
                'optimization_qualities' => $optimizationQualities,
            ]
        ]);
    }
    
    /**
     * Get historical quantum metrics.
     *
     * @return JsonResponse
     */
    public function getHistorical(): JsonResponse
    {
        // Get quantum metrics by day
        $metricsByDay = Block::where('quantum_enhanced', true)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as block_count')
            )
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->take(30)
            ->get();
        
        // Get quantum enhancement adoption trend
        $adoptionTrend = [];
        $totalBlocks = 0;
        $quantumBlocks = 0;
        
        $blocksByDay = Block::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as total'),
            DB::raw('SUM(CASE WHEN quantum_enhanced = 1 THEN 1 ELSE 0 END) as quantum')
        )
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->take(30)
            ->get();
        
        foreach ($blocksByDay as $day) {
            $percentage = $day->total > 0 ? ($day->quantum / $day->total) * 100 : 0;
            
            $adoptionTrend[] = [
                'date' => $day->date,
                'percentage' => round($percentage, 2),
            ];
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'metrics_by_day' => $metricsByDay,
                'adoption_trend' => $adoptionTrend,
            ]
        ]);
    }
    
    /**
     * Analyze quantum metrics.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function analyze(Request $request): JsonResponse
    {
        // Validate request
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'metrics' => 'nullable|array',
        ]);
        
        // Set default dates if not provided
        $startDate = $request->input('start_date', now()->subDays(30)->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());
        
        // Get blocks within date range
        $query = Block::where('quantum_enhanced', true)
            ->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate]);
        
        // Get metrics
        $blocks = $query->get();
        
        // Calculate average metrics
        $miningSpeedups = [];
        $verificationAccuracies = [];
        $aiTrainingEfficiencies = [];
        $optimizationQualities = [];
        
        foreach ($blocks as $block) {
            if (isset($block->quantum_metrics['mining_speedup']['mean'])) {
                $miningSpeedups[] = $block->quantum_metrics['mining_speedup']['mean'];
            }
            
            if (isset($block->quantum_metrics['verification_accuracy']['mean'])) {
                $verificationAccuracies[] = $block->quantum_metrics['verification_accuracy']['mean'];
            }
            
            if (isset($block->quantum_metrics['ai_training_efficiency']['mean'])) {
                $aiTrainingEfficiencies[] = $block->quantum_metrics['ai_training_efficiency']['mean'];
            }
            
            if (isset($block->quantum_metrics['optimization_quality']['mean'])) {
                $optimizationQualities[] = $block->quantum_metrics['optimization_quality']['mean'];
            }
        }
        
        $avgMiningSpeedup = count($miningSpeedups) > 0 ? array_sum($miningSpeedups) / count($miningSpeedups) : 0;
        $avgVerificationAccuracy = count($verificationAccuracies) > 0 ? array_sum($verificationAccuracies) / count($verificationAccuracies) : 0;
        $avgAiTrainingEfficiency = count($aiTrainingEfficiencies) > 0 ? array_sum($aiTrainingEfficiencies) / count($aiTrainingEfficiencies) : 0;
        $avgOptimizationQuality = count($optimizationQualities) > 0 ? array_sum($optimizationQualities) / count($optimizationQualities) : 0;
        
        return response()->json([
            'success' => true,
            'data' => [
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
                'block_count' => count($blocks),
                'avg_metrics' => [
                    'mining_speedup' => round($avgMiningSpeedup, 2),
                    'verification_accuracy' => round($avgVerificationAccuracy, 2),
                    'ai_training_efficiency' => round($avgAiTrainingEfficiency, 2),
                    'optimization_quality' => round($avgOptimizationQuality, 2),
                ],
            ]
        ]);
    }
    
    /**
     * Get default quantum metrics.
     *
     * @return array
     */
    private function getDefaultQuantumMetrics(): array
    {
        return [
            'mining_speedup' => [
                'recent' => $this->generateRandomArray(10, 1.5, 5.0),
                'mean' => rand(20, 40) / 10,
            ],
            'verification_accuracy' => [
                'recent' => $this->generateRandomArray(10, 0.9, 0.99),
                'mean' => rand(90, 99) / 100,
            ],
            'ai_training_efficiency' => [
                'recent' => $this->generateRandomArray(10, 2.0, 8.0),
                'mean' => rand(30, 70) / 10,
            ],
            'optimization_quality' => [
                'recent' => $this->generateRandomArray(10, 1.2, 4.0),
                'mean' => rand(15, 35) / 10,
            ],
        ];
    }
    
    /**
     * Generate a random array of values.
     *
     * @param int $count
     * @param float $min
     * @param float $max
     * @return array
     */
    private function generateRandomArray(int $count, float $min, float $max): array
    {
        $result = [];
        
        for ($i = 0; $i < $count; $i++) {
            $result[] = $min + mt_rand() / mt_getrandmax() * ($max - $min);
        }
        
        return $result;
    }
}