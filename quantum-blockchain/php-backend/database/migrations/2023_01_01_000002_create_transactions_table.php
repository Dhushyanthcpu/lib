<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('block_id')->constrained()->onDelete('cascade');
            $table->string('hash', 64)->unique();
            $table->string('from_address', 64)->nullable();
            $table->string('to_address', 64);
            $table->decimal('amount', 18, 8);
            $table->decimal('fee', 18, 8)->default(0);
            $table->text('signature');
            $table->timestamp('timestamp');
            $table->boolean('quantum_secure')->default(false);
            $table->timestamps();
            
            $table->index('hash');
            $table->index('from_address');
            $table->index('to_address');
        });
    }

    public function down()
    {
        Schema::dropIfExists('transactions');
    }
};
