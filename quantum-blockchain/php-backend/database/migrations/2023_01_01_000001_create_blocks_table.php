<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('blocks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('height')->unique();
            $table->string('hash', 64)->unique();
            $table->string('previous_hash', 64);
            $table->timestamp('timestamp');
            $table->integer('difficulty');
            $table->unsignedBigInteger('nonce');
            $table->integer('size')->default(0);
            $table->text('quantum_signature')->nullable();
            $table->timestamps();
            
            $table->index('height');
            $table->index('hash');
        });
    }

    public function down()
    {
        Schema::dropIfExists('blocks');
    }
};
