<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TimelineController extends Controller
{
    public function index(Request $request) {
        // Get pagination parameter
        $page = $request->get('page', 1);
        $perPage = 5;

        // Fetch activities ordered by most recent first
        $activities = Activity::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('Timeline', [
            'activities' => [
                'data' => $activities->items(),
                'links' => $activities->linkCollection()->toArray(),
                'current_page' => $activities->currentPage(),
                'last_page' => $activities->lastPage(),
                'per_page' => $activities->perPage(),
                'total' => $activities->total(),
            ],
        ]);
    }
}
