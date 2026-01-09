<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Models\Division;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index() {
        // Task counts by status
        $notStartedCount = Task::where('status', 'not_started')->count();
        $inProgressCount = Task::where('status', 'in_progress')->count();
        $completedCount = Task::where('status', 'completed')->count();
        $totalTasks = Task::count();

        // Recent tasks (last 10)
        $recentTasks = Task::with('divisions', 'employee')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Tasks by division
        $tasksByDivision = Division::withCount('tasks')
            ->having('tasks_count', '>', 0)
            ->orderBy('tasks_count', 'desc')
            ->get()
            ->map(function ($division) {
                return [
                    'id' => $division->id,
                    'division_name' => $division->division_name,
                    'division_color' => $division->division_color,
                    'total_tasks' => $division->tasks_count,
                    'not_started' => Task::whereHas('divisions', function($query) use ($division) {
                        $query->where('divisions.id', $division->id);
                    })->where('status', 'not_started')->count(),
                    'in_progress' => Task::whereHas('divisions', function($query) use ($division) {
                        $query->where('divisions.id', $division->id);
                    })->where('status', 'in_progress')->count(),
                    'completed' => Task::whereHas('divisions', function($query) use ($division) {
                        $query->where('divisions.id', $division->id);
                    })->where('status', 'completed')->count(),
                ];
            });

        return Inertia::render('Dashboard', [
            'task_counts' => [
                'not_started' => $notStartedCount,
                'in_progress' => $inProgressCount,
                'completed' => $completedCount,
                'total' => $totalTasks,
            ],
            'recent_tasks' => TaskResource::collection($recentTasks)->resolve(),
            'tasks_by_division' => $tasksByDivision,
        ]);
    }
}
