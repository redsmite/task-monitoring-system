<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    /**
     * Allow specific roles only.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        $allowedRoles = ['ored', 'ms', 'ts'];

        if (!$user || !in_array($user->user_type, $allowedRoles)) {
            abort(403, 'Unauthorized.');
        }

        return $next($request);
    }
}
