<?php

namespace App\Http\Controllers;

use App\Http\Resources\TaskResource;
use App\Models\Activity;
use App\Models\Division;
use App\Models\User;
use App\Models\Task;
use App\Models\TaskUpdate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TaskController extends Controller
{
    /**
     * Helper: check if user can access task
     */
    private function userCanAccessTask($task)
    {
        $user = auth()->user();

        if ($user->user_type === 'admin') {
            return true;
        }

        return $task->divisions()
            ->where('division_id', $user->division_id)
            ->exists();
    }

    /**
     * INDEX
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        $divisions = Division::all();
        $employees = User::orderBy('last_name', 'asc')->get();

        $taskAllPage = $request->get('task_all_page', 1);
        $completedPage = $request->get('completed_page', 1);

        $taskAllSearch = $request->get('task_all_search', '');
        $completedSearch = $request->get('completed_search', '');

        $taskAllSort = $request->get('task_all_sort', 'desc');
        $completedSort = $request->get('completed_sort', 'desc');

        $applySearch = function ($query, $search) {
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%$search%")
                        ->orWhere('last_action', 'like', "%$search%")
                        ->orWhereHas('updates', fn($u) => $u->where('update_text', 'like', "%$search%"))
                        ->orWhereHas('user', fn($u) =>
                            $u->where('first_name', 'like', "%$search%")
                              ->orWhere('last_name', 'like', "%$search%"))
                        ->orWhereHas('divisions', fn($d) =>
                            $d->where('division_name', 'like', "%$search%"));
                });
            }
            return $query;
        };

        /*
        |--------------------------------------------------------------------------
        | TASK ALL QUERY
        |--------------------------------------------------------------------------
        */
        $taskAllQuery = Task::with('divisions', 'user', 'latestUpdate')
            ->whereIn('status', ['not_started', 'in_progress']);

        if ($user->user_type !== 'admin') {
            $taskAllQuery->whereHas('divisions', function ($q) use ($user) {
                $q->where('division_id', $user->division_id);
            });
        }

        $taskAll = $applySearch(
            $taskAllQuery->orderBy('created_at', $taskAllSort),
            $taskAllSearch
        )->paginate(15, ['*'], 'task_all_page', $taskAllPage);

        /*
        |--------------------------------------------------------------------------
        | COMPLETED QUERY
        |--------------------------------------------------------------------------
        */
        $completedQuery = Task::with('divisions', 'user', 'latestUpdate')
            ->where('status', 'completed');

        if ($user->user_type !== 'admin') {
            $completedQuery->whereHas('divisions', function ($q) use ($user) {
                $q->where('division_id', $user->division_id);
            });
        }

        $completed = $applySearch(
            $completedQuery->orderBy('created_at', $completedSort),
            $completedSearch
        )->paginate(15, ['*'], 'completed_page', $completedPage);

        return Inertia::render('Task', [
            'userRole' => $user->user_type,
            'divisions_data' => $divisions,
            'users_data' => $employees,

            'taskAll' => [
                'data' => TaskResource::collection($taskAll->items())->resolve(),
                'links' => $taskAll->linkCollection()->toArray(),
                'current_page' => $taskAll->currentPage(),
                'last_page' => $taskAll->lastPage(),
                'per_page' => $taskAll->perPage(),
                'total' => $taskAll->total(),
            ],

            'completed' => [
                'data' => TaskResource::collection($completed->items())->resolve(),
                'links' => $completed->linkCollection()->toArray(),
                'current_page' => $completed->currentPage(),
                'last_page' => $completed->lastPage(),
                'per_page' => $completed->perPage(),
                'total' => $completed->total(),
            ],
        ]);
    }

    /**
     * STORE
     */
    public function store(Request $request)
    {
        if (auth()->user()->user_type !== 'admin') {
            abort(403);
        }

        $validated = $request->validate([
            'task_name' => 'required|string|max:255',
            'assignee' => 'nullable',
            'division' => 'required',
            'status' => 'required',
        ]);

        $task = Task::create([
            'name' => $validated['task_name'],
            'user_id' => $validated['assignee'],
            'status' => $validated['status'],
        ]);

        $divisionIds = is_array($validated['division'])
            ? $validated['division']
            : [$validated['division']];

        $task->divisions()->sync($divisionIds);

        return back()->with('success', 'Task created');
    }

    /**
     * SHOW
     */
    public function show(Task $task)
    {
        if (!$this->userCanAccessTask($task)) {
            abort(403);
        }

        $task->load(['divisions', 'user', 'updates.user']);

        return response()->json([
            'task' => new TaskResource($task),
        ]);
    }

    /**
     * UPDATE
     */
    public function update(Request $request, Task $task)
    {
        if (!$this->userCanAccessTask($task)) {
            abort(403);
        }

        if (auth()->user()->user_type !== 'admin') {
            abort(403);
        }

        $validated = $request->validate([
            'task_name' => 'sometimes|required',
            'division' => 'sometimes',
            'status' => 'sometimes',
        ]);

        $task->update([
            'name' => $validated['task_name'] ?? $task->name,
            'status' => $validated['status'] ?? $task->status,
        ]);

        if (isset($validated['division'])) {
            $divisionIds = is_array($validated['division'])
                ? $validated['division']
                : [$validated['division']];

            $task->divisions()->sync($divisionIds);
        }

        return back()->with('success', 'Task updated');
    }

    /**
     * DELETE
     */
    public function destroy(Task $task)
    {
        if (!$this->userCanAccessTask($task)) {
            abort(403);
        }

        if (auth()->user()->user_type !== 'admin') {
            abort(403);
        }

        $task->delete();

        return back()->with('success', 'Task deleted');
    }
}
