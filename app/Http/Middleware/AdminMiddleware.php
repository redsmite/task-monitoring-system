<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    /**
     * Only allow admin users.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if (!$user || $user->user_type !== 'admin') {
            abort(403, 'Unauthorized.'); // or redirect('/'); if you want
        }

        return $next($request);
    }
}
