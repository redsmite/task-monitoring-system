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
                        ->orWhereHas('users', fn($u) =>
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
        $taskAllQuery = Task::with('divisions', 'users', 'latestUpdate')
            ->whereIn('status', ['not_started', 'in_progress']);

        if ($user->user_type !== 'admin') {
            $taskAllQuery->whereHas('divisions', function ($q) use ($user) {
                $q->where('division_id', $user->division_id);
            });
        }

        $taskAll = $applySearch(
            $taskAllQuery->orderByRaw("
                CASE 
                    WHEN priority = 'Urgent' THEN 0
                    WHEN priority = 'Regular' THEN 2
                    ELSE 1
                END
            ")
            ->orderByRaw("due_date IS NULL, due_date ASC"),
            $taskAllSearch
        )->paginate(15, ['*'], 'task_all_page', $taskAllPage);

        /*
        |--------------------------------------------------------------------------
        | COMPLETED QUERY
        |--------------------------------------------------------------------------
        */
        $completedQuery = Task::with('divisions', 'users', 'latestUpdate')
            ->where('status', 'completed');

        if ($user->user_type !== 'admin') {
            $completedQuery->whereHas('divisions', function ($q) use ($user) {
                $q->where('division_id', $user->division_id);
            });
        }

        $completed = $applySearch(
            $completedQuery->orderByRaw("
                CASE 
                    WHEN priority = 'Urgent' THEN 0
                    WHEN priority = 'Regular' THEN 2
                    ELSE 1
                END
            ")
            ->orderByRaw("due_date IS NULL, due_date ASC"),
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
    // 🔒 Only admin can create
    if (auth()->user()->user_type !== 'admin') {
        abort(403);
    }

    $validated = $request->validate([
        'task_name'   => 'required|string|max:255',
        'assignee' => 'nullable|array',
        'assignee.*' => 'exists:users,id',
        'division'    => 'required', // array or single
        'last_action' => 'nullable|string|max:255',
        'status'      => 'required|string|max:255',
        'priority'    => 'nullable|string|max:255',
        'created_at'  => 'sometimes|nullable|date',
        'due_date'    => 'nullable|date',
        'description' => 'nullable|string',
    ]);

    // Normalize dates
    $createdAt = !empty($validated['created_at'])
        ? \Carbon\Carbon::parse($validated['created_at'])->startOfDay()
        : now();

    $dueDate = !empty($validated['due_date'])
        ? \Carbon\Carbon::parse($validated['due_date'])->startOfDay()
        : null;

    $task = Task::create([
        'name'        => $validated['task_name'],
        'last_action' => $validated['last_action'] ?? null,
        'assignee' => 'sometimes|array',
        'assignee.*' => 'exists:users,id',
        'status'      => $validated['status'],
        'priority'    => $validated['priority'] ?? null,
        'description' => $validated['description'] ?? null,
        'due_date'    => $dueDate,
        'created_at'  => $createdAt,
        'updated_at'  => $createdAt,
    ]);

    if (array_key_exists('assignee', $validated)) {
        $task->users()->sync($validated['assignee'] ?? []);
    }

    // Handle divisions
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

        $task->load(['divisions', 'users', 'updates.user']);

        return response()->json([
            'task' => new TaskResource($task),
        ]);
    }

    /**
     * UPDATE
     */
public function update(Request $request, Task $task)
{
    // 🔒 Must belong to user's division OR admin
    if (!$this->userCanAccessTask($task)) {
        abort(403);
    }

    // 🔒 Only admin can update
    if (auth()->user()->user_type !== 'admin') {
        abort(403);
    }

    $validated = $request->validate([
        'task_name'   => 'sometimes|required|string|max:255',
        'assignee'    => 'sometimes|nullable',
        'division'    => 'sometimes',
        'last_action' => 'sometimes|nullable|string|max:255',
        'status'      => 'sometimes|string|max:255',
        'priority'    => 'sometimes|nullable|string|max:255',
        'created_at'  => 'sometimes|nullable|date',
        'due_date'    => 'sometimes|nullable|date',
        'description' => 'sometimes|nullable|string',
    ]);

    // Normalize dates
    $createdAt = isset($validated['created_at'])
        ? \Carbon\Carbon::parse($validated['created_at'])->startOfDay()
        : $task->created_at;

    $dueDate = isset($validated['due_date'])
        ? \Carbon\Carbon::parse($validated['due_date'])->startOfDay()
        : $task->due_date;

    $task->update([
        'name'        => $validated['task_name'] ?? $task->name,
        'last_action' => $validated['last_action'] ?? $task->last_action,
        'status'      => $validated['status'] ?? $task->status,
        'priority'    => $validated['priority'] ?? $task->priority,
        'description' => $validated['description'] ?? $task->description,
        'created_at'  => $createdAt,
        'due_date'    => $dueDate,
    ]);

    if (isset($validated['assignee'])) {
        $task->users()->sync($validated['assignee']);
    }

    // Sync divisions if provided
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
    // Store a new task update
    public function storeUpdate(Task $task, Request $request)
    {
        if (auth()->user()->user_type !== 'admin') {
            abort(403);
        }

        $request->validate([
            'update_text' => 'required|string|max:255',
        ]);

        $task->updates()->create([
            'update_text' => $request->update_text,
            'user_id' => auth()->id(),
        ]);

        // ✅ Return back with success flash message (Inertia compatible)
        return back()->with('success', 'Update added successfully');
    }

    // Update an existing task update
    public function updateUpdate(Task $task, TaskUpdate $update, Request $request)
    {
        if (auth()->user()->user_type !== 'admin') {
            abort(403);
        }

        $request->validate([
            'update_text' => 'required|string|max:255',
        ]);

        $update->update([
            'update_text' => $request->update_text,
        ]);

        return back()->with('success', 'Update updated successfully');
    }

    // Delete a task update
    public function destroyUpdate(Task $task, TaskUpdate $update)
    {
        if (auth()->user()->user_type !== 'admin') {
            abort(403);
        }

        $update->delete();

        return back()->with('success', 'Update deleted successfully');
    }
}
