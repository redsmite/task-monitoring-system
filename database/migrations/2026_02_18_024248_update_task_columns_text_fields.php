<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('name', 500)->change();     // varchar(500)
            $table->text('description')->nullable()->change();
        });

        Schema::table('task_updates', function (Blueprint $table) {
            $table->text('update_text')->change();
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('name')->change();          // back to 255
            $table->string('description')->nullable()->change();
        });

        Schema::table('task_updates', function (Blueprint $table) {
            $table->string('update_text')->change();
        });
    }
};
