<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AIController;
use App\Http\Controllers\BlockchainController;
use App\Http\Controllers\MiningController;
use App\Http\Controllers\OptimizationController;
use App\Http\Controllers\SecurityController;
use App\Http\Controllers\TransactionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Blockchain routes
Route::prefix('blockchain')->group(function () {
    Route::get('/stats', [BlockchainController::class, 'getStats']);
    Route::get('/blocks', [BlockchainController::class, 'getBlocks']);
    Route::get('/pending-transactions', [BlockchainController::class, 'getPendingTransactions']);
});

// Account routes
Route::prefix('accounts')->group(function () {
    Route::get('/{address}/balance', [AccountController::class, 'getBalance']);
    Route::post('/create', [AccountController::class, 'create']);
    Route::get('/', [AccountController::class, 'getAll']);
});

// Transaction routes
Route::prefix('transactions')->group(function () {
    Route::post('/create', [TransactionController::class, 'create']);
    Route::get('/{hash}', [TransactionController::class, 'getByHash']);
});

// Mining routes
Route::prefix('mining')->group(function () {
    Route::post('/mine-block', [MiningController::class, 'mineBlock']);
});

// AI routes
Route::prefix('ai')->group(function () {
    Route::post('/train', [AIController::class, 'train']);
    Route::post('/predict', [AIController::class, 'predict']);
    Route::get('/models', [AIController::class, 'getAll']);
    Route::get('/models/{modelId}', [AIController::class, 'getById']);
});

// Optimization routes
Route::prefix('optimization')->group(function () {
    Route::post('/optimize', [OptimizationController::class, 'optimize']);
});

// Security routes
Route::prefix('security')->group(function () {
    Route::post('/analyze', [SecurityController::class, 'analyze']);
    Route::get('/latest', [SecurityController::class, 'getLatest']);
});