<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = DB::getSchemaBuilder()->getColumnListing('users');

            if (in_array('password', $columns)) {
                $table->dropColumn('password');
            }
            if (in_array('pin', $columns)) {
                $table->dropColumn('pin');
            }
            if (in_array('remember_token', $columns)) {
                $table->dropColumn('remember_token');
            }
            if (in_array('email_verified_at', $columns)) {
                $table->dropColumn('email_verified_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable();
            $table->string('pin')->nullable();
            $table->string('remember_token')->nullable();
            $table->timestamp('email_verified_at')->nullable();
        });
    }
};
