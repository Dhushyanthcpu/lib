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
        Schema::create('security_analyses', function (Blueprint $table) {
            $table->id();
            $table->decimal('vulnerability_score', 5, 2);
            $table->integer('qubits_needed_to_break');
            $table->decimal('estimated_quantum_years_to_break', 10, 2);
            $table->json('recommendations');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('security_analyses');
    }
};