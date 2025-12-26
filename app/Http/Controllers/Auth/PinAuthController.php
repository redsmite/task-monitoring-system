<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Inertia\Inertia;

class PinAuthController extends Controller
{
    public function show()
    {
        return Inertia::render('Auth/PinLogin');
    }

    public function login(Request $request)
    {
        $request->validate([
            'pin' => ['required', 'string'],
        ]);

        $user = User::all()->first(function ($user) use ($request) {
            return $user->pin && Hash::check($request->pin, $user->pin);
        });

        if (!$user) {
            return back()->withErrors([
                'pin' => 'Invalid PIN.',
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard.index'));
    }
}
