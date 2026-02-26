<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ExternalSessionAuth
{
    public function handle(Request $request, Closure $next)
    {
        $sessionId = $request->query('session_id');


        if (!$sessionId) {
            return $next($request);
        }

        // --------------------------------------------------
        // Get external user from core system
        // --------------------------------------------------
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

        if (!$external) {
            abort(403, 'Invalid external session.');
        }

        // --------------------------------------------------
        // Normalize values (failsafe)
        // --------------------------------------------------
        $email = $external->email ?? $external->username.'@external.local';
        $position = $external->position ?? 'N/A';
        $division = $external->division ?? null;

        // --------------------------------------------------
        // If already logged in and same user → just sync
        // --------------------------------------------------
        if (Auth::check()) {
            $current = Auth::user();

            if ($current->external_user_id == $external->external_user_id) {

                $current->update([
                    'name' => $external->username,
                    'first_name' => $external->first_name,
                    'last_name' => $external->last_name,
                    'position' => $position,
                    'division_id' => $division,
                    'email' => $email,
                ]);

                return $next($request);
            }

            // different user → logout
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        // --------------------------------------------------
        // Find or create local user
        // --------------------------------------------------
        $user = User::where('external_user_id', $external->external_user_id)->first();

        if (!$user) {

            // avoid duplicate email crash
            $existingEmail = User::where('email', $email)->first();
            if ($existingEmail) {
                $email = $external->username.'_'.$external->external_user_id.'@external.local';
            }

            $user = User::create([
                'name' => $external->username,
                'first_name' => $external->first_name,
                'last_name' => $external->last_name,
                'position' => $position,
                'division_id' => $division,
                'email' => $email,
                'user_type' => 'non-user',
                'external_user_id' => $external->external_user_id,
            ]);

        } else {

            // 🔄 ALWAYS SYNC FROM CORE
            $user->update([
                'name' => $external->username,
                'first_name' => $external->first_name,
                'last_name' => $external->last_name,
                'position' => $position,
                'division_id' => $division,
                'email' => $email,
            ]);
        }

        // --------------------------------------------------
        // Role whitelist security check (FINAL GUARD)
        // --------------------------------------------------

        $allowedRoles = ['user', 'ored', 'ms', 'ts'];

        if (!in_array($user->user_type, $allowedRoles)) {

            // Force logout safety cleanup
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            abort(403, 'Unauthorized access');
        }

        Auth::login($user);
        
        $request->session()->regenerate();

        return $next($request);
    }
}
