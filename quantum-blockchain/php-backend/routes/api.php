<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BlockchainController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Blockchain public endpoints
Route::get('/blockchain/height', [BlockchainController::class, 'getHeight']);
Route::get('/blockchain/block/{height}', [BlockchainController::class, 'getBlock']);
Route::get('/blockchain/transaction/{hash}', [BlockchainController::class, 'getTransaction']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Blockchain protected endpoints
    Route::post('/blockchain/transaction', [BlockchainController::class, 'submitTransaction']);
    Route::get('/blockchain/balance/{address}', [BlockchainController::class, 'getBalance']);
    Route::get('/blockchain/dashboard', [BlockchainController::class, 'getDashboardData']);
});
