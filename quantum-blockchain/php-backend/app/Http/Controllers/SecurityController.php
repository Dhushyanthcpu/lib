<?php

namespace App\Http\Controllers;

use App\Models\SecurityAnalysis;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SecurityController extends Controller
{
    /**
     * Analyze blockchain security.
     *
     * @return JsonResponse
     */
    public function analyze(): JsonResponse
    {
        // Analyze blockchain security
        $securityAnalysis = SecurityAnalysis::analyze();
        
        return response()->json([
            'security_analysis' => [
                'vulnerability_score' => $securityAnalysis->vulnerability_score,
                'qubits_needed_to_break' => $securityAnalysis->qubits_needed_to_break,
                'estimated_quantum_years_to_break' => $securityAnalysis->estimated_quantum_years_to_break,
                'recommendations' => $securityAnalysis->recommendations,
            ],
        ]);
    }

    /**
     * Get latest security analysis.
     *
     * @return JsonResponse
     */
    public function getLatest(): JsonResponse
    {
        // Get the latest security analysis
        $securityAnalysis = SecurityAnalysis::latest()->first();
        
        if (!$securityAnalysis) {
            return response()->json([
                'error' => 'No security analysis found',
            ], 404);
        }
        
        return response()->json([
            'security_analysis' => [
                'vulnerability_score' => $securityAnalysis->vulnerability_score,
                'qubits_needed_to_break' => $securityAnalysis->qubits_needed_to_break,
                'estimated_quantum_years_to_break' => $securityAnalysis->estimated_quantum_years_to_break,
                'recommendations' => $securityAnalysis->recommendations,
                'created_at' => $securityAnalysis->created_at->timestamp,
            ],
        ]);
    }
}