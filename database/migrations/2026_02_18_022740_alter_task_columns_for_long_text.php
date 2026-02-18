<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // TASK TABLE
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('name', 500)->change();   // varchar(500)
            $table->text('description')->nullable()->change(); // text
        });

        // TASK UPDATES TABLE
        Schema::table('task_updates', function (Blueprint $table) {
            $table->text('update_text')->change(); // text
        });
    }

    public function down(): void
    {
        // rollback if needed
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('name', 255)->change();   // back to default
            $table->string('description')->nullable()->change(); 
        });

        Schema::table('task_updates', function (Blueprint $table) {
            $table->string('update_text')->change();
        });
    }
};
