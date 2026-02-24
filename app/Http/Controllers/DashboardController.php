<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Models\Division;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        /*
        |--------------------------------------------------------------------------
        | Base Query (division filtering)
        |--------------------------------------------------------------------------
        */

        $taskQuery = Task::query();

        // If NOT admin → only show tasks in user's division
        if (!in_array($user->user_type, ['ored', 'ms', 'ts'])) {
            $taskQuery->whereHas('divisions', function ($q) use ($user) {
                $q->where('division_id', $user->division_id);
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Counts
        |--------------------------------------------------------------------------
        */

        $notStartedCount = (clone $taskQuery)
            ->where('status', 'not_started')
            ->count();

        $inProgressCount = (clone $taskQuery)
            ->where('status', 'in_progress')
            ->count();

        $completedCount = (clone $taskQuery)
            ->where('status', 'completed')
            ->count();

        $totalTasks = (clone $taskQuery)->count();

        /*
        |--------------------------------------------------------------------------
        | Recent Tasks
        |--------------------------------------------------------------------------
        */

        $recentTasks = (clone $taskQuery)
            ->with('divisions', 'user')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Tasks by Division
        |--------------------------------------------------------------------------
        */

        if (in_array($user->user_type, ['ored', 'ms', 'ts'])) {
            // Admin → show all divisions
            $divisions = Division::withCount('tasks')
                ->having('tasks_count', '>', 0)
                ->orderBy('tasks_count', 'desc')
                ->get();
        } else {
            // User → only their division
            $divisions = Division::where('id', $user->division_id)
                ->withCount('tasks')
                ->get();
        }

        $tasksByDivision = $divisions->map(function ($division) use ($user) {

            $base = Task::whereHas('divisions', function ($q) use ($division) {
                $q->where('divisions.id', $division->id);
            });

            // If user → extra safety filter
            if (!in_array($user->user_type, ['ored', 'ms', 'ts'])) {
                $base->whereHas('divisions', function ($q) use ($user) {
                    $q->where('division_id', $user->division_id);
                });
            }

            return [
                'id' => $division->id,
                'division_name' => $division->division_name,
                'division_color' => $division->division_color,

                'total_tasks' => (clone $base)->count(),

                'not_started' => (clone $base)
                    ->where('status', 'not_started')
                    ->count(),

                'in_progress' => (clone $base)
                    ->where('status', 'in_progress')
                    ->count(),

                'completed' => (clone $base)
                    ->where('status', 'completed')
                    ->count(),
            ];
        });

        /*
        |--------------------------------------------------------------------------
        | Render
        |--------------------------------------------------------------------------
        */

        return Inertia::render('Dashboard', [
            'task_counts' => [
                'not_started' => $notStartedCount,
                'in_progress' => $inProgressCount,
                'completed' => $completedCount,
                'total' => $totalTasks,
            ],
            'recent_tasks' => TaskResource::collection($recentTasks)->resolve(),
            'tasks_by_division' => $tasksByDivision,
            'userRole' => $user->user_type,
        ]);
    }
}
