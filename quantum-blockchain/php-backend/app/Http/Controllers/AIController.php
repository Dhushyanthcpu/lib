<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\AIModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AIController extends Controller
{
    /**
     * Train a new AI model.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function train(Request $request): JsonResponse
    {
        // Validate request
        $request->validate([
            'owner_address' => 'required|string',
            'model_config' => 'required|array',
            'training_data' => 'required|array',
        ]);
        
        // Check if owner exists
        $owner = Account::where('address', $request->owner_address)->first();
        
        if (!$owner) {
            return response()->json([
                'error' => 'Owner account not found',
            ], 404);
        }
        
        // Train a new AI model
        $aiModel = AIModel::train(
            $request->owner_address,
            $request->model_config,
            $request->training_data
        );
        
        return response()->json([
            'model_id' => $aiModel->model_id,
            'owner' => $aiModel->owner,
            'config' => $aiModel->config,
            'training_result' => $aiModel->training_result,
            'created_at' => $aiModel->created_at->timestamp,
        ]);
    }

    /**
     * Make a prediction with an AI model.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function predict(Request $request): JsonResponse
    {
        // Validate request
        $request->validate([
            'model_id' => 'required|string',
            'input_data' => 'required|array',
        ]);
        
        // Find AI model by ID
        $aiModel = AIModel::where('model_id', $request->model_id)->first();
        
        if (!$aiModel) {
            return response()->json([
                'error' => 'AI model not found',
            ], 404);
        }
        
        // Make a prediction
        $prediction = $aiModel->predict($request->input_data);
        
        return response()->json([
            'model_id' => $aiModel->model_id,
            'prediction' => $prediction,
        ]);
    }

    /**
     * Get all AI models.
     *
     * @return JsonResponse
     */
    public function getAll(): JsonResponse
    {
        // Get all AI models
        $aiModels = AIModel::all();
        
        return response()->json([
            'models' => $aiModels,
        ]);
    }

    /**
     * Get AI model by ID.
     *
     * @param string $modelId
     * @return JsonResponse
     */
    public function getById(string $modelId): JsonResponse
    {
        // Find AI model by ID
        $aiModel = AIModel::where('model_id', $modelId)->first();
        
        if (!$aiModel) {
            return response()->json([
                'error' => 'AI model not found',
            ], 404);
        }
        
        return response()->json($aiModel);
    }
}