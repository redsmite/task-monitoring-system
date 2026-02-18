<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ExternalSessionAuth
{
    public function handle(Request $request, Closure $next)
    {
        $sessionId = $request->query('session_id');

        // no external session → continue normally
        if (!$sessionId) {
            return $next($request);
        }

        $external = DB::connection('denr_ncr')
            ->table('core_session as s')
            ->join('core_users as u', 's.userid', '=', 'u.id')
            ->select(
                'u.id as external_user_id',
                'u.username',
                'u.email',
                'u.first_name',
                'u.middle_name',
                'u.last_name',
                'u.current_position as position',
                'u.division'
            )
            ->where('s.session_id', $sessionId)
            ->where('s.guest', 0)
            ->first();

        // ❌ no valid session → deny access
        if (!$external) {
            abort(403, 'Invalid external session.');
        }

        // 🔁 already logged in?
        if (Auth::check()) {
            $current = Auth::user();

            // different external user → force relogin
            if ($current->external_user_id != $external->external_user_id) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            } else {
                return $next($request);
            }
        }

        // find or create local user (no password/pin)
        $user = User::where('external_user_id', $external->external_user_id)->first();

        if (!$user) {
            $user = User::create([
                'name' => $external->username,
                'first_name' => $external->first_name,
                'last_name' => $external->last_name,
                'position' => $external->position,
                'division_id' => $external->division,
                'email' => $external->email ?? $external->username.'@external.local',
                'user_type' => 'user',
                'external_user_id' => $external->external_user_id,
            ]);
        } else {
            $user->update([
                'first_name' => $external->first_name,
                'last_name' => $external->last_name,
                'position' => $external->position,
                'division_id' => $external->division,
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return $next($request);
    }
}
