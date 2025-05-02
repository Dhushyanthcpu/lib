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
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->string('address', 64)->unique();
            $table->decimal('balance', 18, 8)->default(0);
            $table->string('public_key')->nullable();
            $table->string('private_key')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('name')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->string('type')->default('standard'); // standard, savings, trading, etc.
            $table->timestamps();
            
            // Add indexes for better performance
            $table->index('user_id');
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};