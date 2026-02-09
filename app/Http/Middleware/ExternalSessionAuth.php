<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class ExternalSessionAuth
{
    public function handle(Request $request, Closure $next)
    {
        // Already logged in
        if (Auth::check()) {
            return $next($request);
        }

        // Get session_id from URL query
        $sessionId = $request->query('session_id');

        if (!$sessionId) {
            return $next($request);
        }

        // Look up external session in secondary DB
    $external = DB::connection('denr_ncr')
        ->table('core_session as s')
        ->join('core_users as u', 's.userid', '=', 'u.id')
        ->select('u.id as external_id', 'u.username')
        ->where('s.session_id', $sessionId)
        ->first();

        if ($external) {
            // Find Laravel user mapped to external_user_id
            $user = User::where('external_user_id', $external->external_id)->first();

            if (!$user) {
                // Auto-create Laravel user if it doesn't exist
                $user = User::create([
                    'name' => $external->username,
                    'email' => $external->username.'@example.com', // default email
                    'password' => bcrypt('defaultpassword'),      // default password
                    'pin' => bcrypt('1234'),                      // default pin
                    'user_type' => 'user',
                    'external_user_id' => $external->external_id,
                ]);
            }

            // Log in the Laravel user
            Auth::login($user);
        }

        return $next($request);
    }
}