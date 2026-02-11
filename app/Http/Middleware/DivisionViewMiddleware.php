<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DivisionViewMiddleware
{
    /**
     * Attach the user division filter to the request
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if ($user && $user->user_type === 'user') {
            // Only let the request query tasks for this user's division
            $request->merge(['division_filter' => $user->division_id ?? null]);
        }

        return $next($request);
    }
}
