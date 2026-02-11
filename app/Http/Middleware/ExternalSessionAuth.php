<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ExternalSessionAuth
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            return $next($request);
        }

        $sessionId = $request->query('session_id');

        if (!$sessionId) {
            return $next($request);
        }

        $external = DB::connection('denr_ncr')
            ->table('core_session as s')
            ->join('core_users as u', 's.userid', '=', 'u.id')
            ->select(
                'u.id as external_id',
                'u.username',
                'u.first_name',
                'u.middle_name',
                'u.last_name',
                'u.current_position as position',
                'u.division',
            )
            ->where('s.session_id', $sessionId)
            ->first();

        if ($external) {

            $user = User::where('external_user_id', $external->external_id)->first();

            if (!$user) {
                $user = User::create([
                    'name' => $external->username,
                    'first_name' => $external->first_name,
                    'last_name' => $external->last_name,
                    'position' => $external->position,
                    'division_id' => $external->division,
                    'email' => $external->username.'@example.com',
                    'email_verified_at' => now(),
                    'password' => Hash::make('defaultpassword'),
                    'pin' => Hash::make('1234'),
                    'user_type' => 'user',
                    'external_user_id' => $external->external_id,
                    'remember_token' => Str::random(10),
                ]);
            } else {
                // keep synced
                $user->update([
                    'first_name' => $external->first_name,
                    'last_name' => $external->last_name,
                    'position' => $external->position,
                ]);
            }

            Auth::login($user);
        }

        return $next($request);
    }
}
