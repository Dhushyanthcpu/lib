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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('hash', 64)->unique();
            $table->string('sender', 64);
            $table->string('recipient', 64);
            $table->decimal('amount', 18, 8);
            $table->timestamp('transaction_timestamp');
            $table->string('type')->default('transfer');
            $table->json('data')->nullable();
            $table->string('status')->default('pending');
            $table->foreignId('block_id')->nullable()->constrained('blocks')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};