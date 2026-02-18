<?php

// -----------------------------------------------------------
// 1️⃣ Bootstrap Laravel manually (new style)
// -----------------------------------------------------------
require __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

$app = Application::configure(basePath: __DIR__)
    ->withRouting(
        web: __DIR__.'/routes/web.php',
        commands: __DIR__.'/routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\DivisionViewMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();

// -----------------------------------------------------------
// Boot kernel to allow facades, DB, and Eloquent
// -----------------------------------------------------------
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

// -----------------------------------------------------------
// 2️⃣ Import classes
// -----------------------------------------------------------
use Illuminate\Support\Facades\DB;
use App\Models\User;

// -----------------------------------------------------------
// 3️⃣ Fetch users from core_users
// -----------------------------------------------------------
$externalUsers = DB::connection('denr_ncr')
    ->table('core_users')
    ->whereIn('employee_type', [1])
    ->get();

echo "Found {$externalUsers->count()} external users.\n";

// -----------------------------------------------------------
// 4️⃣ Sync users into local users table
// -----------------------------------------------------------
foreach ($externalUsers as $ext) {

    // Try to find existing user by external_user_id OR email
    $user = User::where('external_user_id', $ext->id)
                ->orWhere('email', $ext->email)
                ->first();

    $position = $ext->current_position ?? $ext->position ?? 'N/A'; // fail-safe

    if (!$user) {
        User::create([
            'name' => $ext->username,
            'first_name' => $ext->first_name,
            'last_name' => $ext->last_name,
            'position' => $position,
            'division_id' => $ext->division,
            'email' => $ext->email ?? $ext->username.'@external.local',
            'user_type' => 'user',
            'external_user_id' => $ext->id,
        ]);

        echo "Created user: {$ext->username}\n";

    } else {
        $user->update([
            'first_name' => $ext->first_name,
            'last_name' => $ext->last_name,
            'position' => $position,
            'division_id' => $ext->division,
            'email' => $ext->email ?? $ext->username.'@external.local', // ensure email stays consistent
            'external_user_id' => $ext->id, // in case it was null
        ]);

        echo "Updated user: {$ext->username}\n";
    }
}


echo "Sync complete.\n";
