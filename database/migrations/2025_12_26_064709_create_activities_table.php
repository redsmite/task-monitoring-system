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
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->string('action'); // created, updated, deleted
            $table->string('model_type'); // Task, Employee, Division, etc.
            $table->unsignedBigInteger('model_id')->nullable();
            $table->string('description'); // Human-readable description
            $table->json('changes')->nullable(); // Store what changed (for updates)
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
