<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('blocks', function (Blueprint $table) {
            $table->id();
            $table->integer('index')->unique();
            $table->timestamp('block_timestamp');
            $table->string('previous_hash', 64);
            $table->string('hash', 64)->unique();
            $table->integer('nonce');
            $table->integer('difficulty');
            $table->boolean('quantum_enhanced')->default(false);
            $table->json('quantum_metrics')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blocks');
    }
};