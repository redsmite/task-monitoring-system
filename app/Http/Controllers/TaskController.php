<?php

namespace App\Http\Controllers;

use App\Http\Resources\TaskResource;
// use App\Models\Activity;
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

        // Regular user → only their division
        if ($user->user_type === 'user') {
            return $task->divisions()
                ->where('division_id', $user->division_id)
                ->exists();
        }

        // Admin types → must match originating_office
        if (in_array($user->user_type, ['ored', 'ms', 'ts'])) {
            return $task->originating_office === $user->user_type;
        }

        return false;
    }
    private function ensureOfficeOwnership(Task $task)
    {
        $user = auth()->user();

        if ($task->originating_office !== $user->user_type) {
            abort(403);
        }
    }

    /**
     * INDEX
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        $divisions = Division::all();
        $employees = User::orderBy('last_name', 'asc')->get();

        /*
        |--------------------------------------------------------------------------
        | Optional Office Filter (Frontend Tabs Support)
        |--------------------------------------------------------------------------
        | This allows:
        | ?office=ored
        | ?office=ms
        | ?office=ts
        |
        */
        $officeFilter = $request->get('office');

        if (!in_array($officeFilter, ['ored','ms','ts'])) {
            $officeFilter = null;
        }

        /*
        |--------------------------------------------------------------------------
        | Search Helper
        |--------------------------------------------------------------------------
        */
        $applySearch = function ($query, $search) {

            if (!empty($search)) {
                $query->where(function ($q) use ($search) {

                    $q->where('name', 'like', "%$search%")
                        ->orWhere('last_action', 'like', "%$search%")
                        ->orWhereHas('updates', fn($u) =>
                            $u->where('update_text', 'like', "%$search%")
                        )
                        ->orWhereHas('users', fn($u) =>
                            $u->where('first_name', 'like', "%$search%")
                                ->orWhere('last_name', 'like', "%$search%")
                        )
                        ->orWhereHas('divisions', fn($d) =>
                            $d->where('division_name', 'like', "%$search%")
                        );
                });
            }

            return $query;
        };

        /*
        |--------------------------------------------------------------------------
        | Base Task Queries
        |--------------------------------------------------------------------------
        */

        $taskAllQuery = Task::with([
            'divisions',
            'users.division',
            'latestUpdate'
        ])->whereIn('status', ['not_started','in_progress']);

        $completedQuery = Task::with([
            'divisions',
            'users.division',
            'latestUpdate'
        ])->where('status','completed');

        /*
        |--------------------------------------------------------------------------
        | Role Based Filtering
        |--------------------------------------------------------------------------
        */

        if ($user->user_type === 'user') {

            // Regular user → division restriction only
            $taskAllQuery->whereHas('divisions', function ($q) use ($user) {
                $q->where('division_id', $user->division_id);
            });

            $completedQuery->whereHas('divisions', function ($q) use ($user) {
                $q->where('division_id', $user->division_id);
            });
        }
        else {

            // Admins → optional office filter
            if ($officeFilter) {
                $taskAllQuery->where('originating_office', $officeFilter);
                $completedQuery->where('originating_office', $officeFilter);
            }
            // Otherwise show ALL tasks
        }

        /*
        |--------------------------------------------------------------------------
        | Sorting
        |--------------------------------------------------------------------------
        */

        $taskAllPage = $request->get('task_all_page', 1);
        $completedPage = $request->get('completed_page', 1);

        $taskAllSearch = $request->get('task_all_search','');
        $completedSearch = $request->get('completed_search','');

        /*
        |--------------------------------------------------------------------------
        | Query Execution
        |--------------------------------------------------------------------------
        */

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
        )->paginate(15,['*'],'task_all_page',$taskAllPage);

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
        )->paginate(15,['*'],'completed_page',$completedPage);

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return Inertia::render('Task', [
            'userRole' => $user->user_type,
            'isAdmin' => in_array($user->user_type,['ored','ms','ts']),
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
        $user = auth()->user();

        // 🔐 Only admin roles can create
        if (!in_array($user->user_type, ['ored', 'ms', 'ts'])) {
            abort(403);
        }

        // ✅ VALIDATE FIRST
        $validated = $request->validate([
            'task_name'   => 'required|string|max:255',
            'assignee'    => 'nullable|array',
            'assignee.*'  => 'exists:users,id',
            'division'    => 'required',
            'last_action' => 'nullable|string|max:255',
            'status'      => 'required|string|max:255',
            'priority'    => 'nullable|string|max:255',
            'created_at'  => 'sometimes|nullable|date',
            'due_date'    => 'nullable|date',
            'description' => 'nullable|string',
            // 'office'      => 'required|in:ored,ms,ts',
        ]);

        // 🔐 Now safe to check
        // if ($validated['office'] !== $user->user_type) {
        //     abort(403, 'You are not authorized to add task on this tab');
        // }

        // Normalize dates
        $createdAt = !empty($validated['created_at'])
            ? \Carbon\Carbon::parse($validated['created_at'])->startOfDay()
            : now();

        $dueDate = !empty($validated['due_date'])
            ? \Carbon\Carbon::parse($validated['due_date'])->startOfDay()
            : null;

        $task = Task::create([
            'name'               => $validated['task_name'],
            'originating_office' => $user->user_type,
            'last_action'        => $validated['last_action'] ?? null,
            'status'             => $validated['status'],
            'priority'           => $validated['priority'] ?? null,
            'description'        => $validated['description'] ?? null,
            'due_date'           => $dueDate,
            'created_at'         => $createdAt,
            'updated_at'         => $createdAt,
        ]);

        if (array_key_exists('assignee', $validated)) {
            $task->users()->sync($validated['assignee'] ?? []);
        }

        $divisionIds = is_array($validated['division'])
            ? $validated['division']
            : [$validated['division']];

        $task->divisions()->sync($divisionIds);

        $task->updates()->create([
            'update_text' => $validated['last_action'] ?? 'Task created.',
            'user_id'     => $user->id,
        ]);

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
        $this->ensureOfficeOwnership($task);

        // 🔒 Must belong to user's division OR admin
        if (!$this->userCanAccessTask($task)) {
            abort(403);
        }

        // 🔒 Only admin can update
        if (!in_array(auth()->user()->user_type, ['ored', 'ms', 'ts'])) {
            abort(403);
        }

        $validated = $request->validate([
            'task_name'   => 'sometimes|required|string|max:255',
            'assignee'    => 'sometimes|nullable|array',
            'assignee.*'  => 'exists:users,id',
            'division'    => 'sometimes',
            'last_action' => 'sometimes|nullable|string|max:255',
            'status'      => 'sometimes|nullable|string|max:255',
            'priority'    => 'sometimes|nullable|string|max:255',
            'created_at'  => 'sometimes|nullable|date',
            'due_date'    => 'sometimes|nullable|date',
            'description' => 'sometimes|nullable|string',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Capture original values BEFORE updating
        |--------------------------------------------------------------------------
        */

        $originalAttributes = $task->getOriginal();
        $originalUsers = $task->users()->pluck('users.id')->toArray();
        $originalDivisions = $task->divisions()->pluck('divisions.id')->toArray();

        /*
        |--------------------------------------------------------------------------
        | Normalize dates
        |--------------------------------------------------------------------------
        */

        $createdAt = isset($validated['created_at'])
            ? \Carbon\Carbon::parse($validated['created_at'])->startOfDay()
            : $task->created_at;

        $dueDate = isset($validated['due_date'])
            ? \Carbon\Carbon::parse($validated['due_date'])->startOfDay()
            : $task->due_date;

        /*
        |--------------------------------------------------------------------------
        | Update main task
        |--------------------------------------------------------------------------
        */

        $task->update([
            'name'        => $validated['task_name'] ?? $task->name,
            'last_action' => $validated['last_action'] ?? $task->last_action,
            'status'      => $validated['status'] ?? $task->status,
            'priority'    => $validated['priority'] ?? $task->priority,
            'description' => $validated['description'] ?? $task->description,
            'created_at'  => $createdAt,
            'due_date'    => $dueDate,
        ]);

        /*
        |--------------------------------------------------------------------------
        | Sync assignees
        |--------------------------------------------------------------------------
        */

        if (isset($validated['assignee'])) {
            $task->users()->sync($validated['assignee'] ?? []);
        }

        /*
        |--------------------------------------------------------------------------
        | Sync divisions
        |--------------------------------------------------------------------------
        */

        if (isset($validated['division'])) {
            $divisionIds = is_array($validated['division'])
                ? $validated['division']
                : [$validated['division']];

            $task->divisions()->sync($divisionIds);
        }

        /*
        |--------------------------------------------------------------------------
        | Add update history entry
        |--------------------------------------------------------------------------
        */

        if (!empty($validated['last_action'])) {
            $task->updates()->create([
                'update_text' => $validated['last_action'],
                'user_id'     => auth()->id(),
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Detect changes safely
        |--------------------------------------------------------------------------
        */

        $task->refresh();
        $changes = [];

        $fieldsToTrack = ['name', 'status', 'priority', 'description', 'due_date'];

        foreach ($fieldsToTrack as $field) {

            $oldValue = $originalAttributes[$field] ?? null;
            $newValue = $task->$field ?? null;

            // Convert Carbon to string
            if ($oldValue instanceof \Carbon\Carbon) {
                $oldValue = $oldValue->toDateString();
            }

            if ($newValue instanceof \Carbon\Carbon) {
                $newValue = $newValue->toDateString();
            }

            if ($oldValue !== $newValue) {
                $changes[$field] = [
                    'old' => $oldValue !== null ? (string) $oldValue : null,
                    'new' => $newValue !== null ? (string) $newValue : null,
                ];
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Detect assignee changes
        |--------------------------------------------------------------------------
        */

        $newUsers = $task->users()->pluck('users.id')->toArray();

        if ($originalUsers !== $newUsers) {
            $changes['assignee'] = [
                'old' => $originalUsers,
                'new' => $newUsers,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Detect division changes
        |--------------------------------------------------------------------------
        */

        $newDivisions = $task->divisions()->pluck('divisions.id')->toArray();

        if ($originalDivisions !== $newDivisions) {
            $changes['division'] = [
                'old' => $originalDivisions,
                'new' => $newDivisions,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Create activity if something changed
        |--------------------------------------------------------------------------
        */

        // if (!empty($changes)) {
        //     \App\Models\Activity::create([
        //         'action'      => 'updated',
        //         'model_type'  => \App\Models\Task::class,
        //         'model_id'    => $task->id,
        //         'description' => 'Updated task: ' . $task->name,
        //         'changes'     => $changes,
        //         'user_id'     => auth()->id(),
        //     ]);
        // }

        return back()->with('success', 'Task updated');
    }


    /**
     * DELETE
     */
    public function destroy(Task $task)
    {
        $this->ensureOfficeOwnership($task);

        if (!$this->userCanAccessTask($task)) {
            abort(403);
        }

        if (!in_array(auth()->user()->user_type, ['ored', 'ms', 'ts'])) {
            abort(403);
        }

        /*
        |--------------------------------------------------------------------------
        | Capture task state before deletion
        |--------------------------------------------------------------------------
        */

        $taskData = [
            'status'   => $task->status,
            'priority' => $task->priority,
            'due_date' => $task->due_date,
            'name'     => $task->name
        ];

        $assignees = $task->users()->pluck('users.id')->toArray();
        $divisions = $task->divisions()->pluck('divisions.id')->toArray();

        /*
        |--------------------------------------------------------------------------
        | Log activity
        |--------------------------------------------------------------------------
        */

        // \App\Models\Activity::create([
        //     'action'      => 'deleted',
        //     'model_type'  => \App\Models\Task::class,
        //     'model_id'    => $task->id,
        //     'description' => 'Deleted task: ' . $task->name,
        //     'changes'     => [
        //         'task' => [
        //             'old' => [
        //                 'name' => $taskData['name'],
        //                 'status' => $taskData['status'],
        //                 'priority' => $taskData['priority'],
        //                 'due_date' => $taskData['due_date'],
        //                 'assignee' => $assignees,
        //                 'division' => $divisions
        //             ],
        //             'new' => null
        //         ]
        //     ],
        //     'user_id' => auth()->id(),
        // ]);

        /*
        |--------------------------------------------------------------------------
        | Delete task
        |--------------------------------------------------------------------------
        */

        $task->delete();

        return back()->with('success', 'Task deleted');
    }

    // Store a new task update
    public function storeUpdate(Task $task, Request $request)
    {
        $user = auth()->user();
        $this->ensureOfficeOwnership($task);

        // 🔐 Role check
        if (!in_array($user->user_type, ['ored', 'ms', 'ts'])) {
            abort(403);
        }


        $request->validate([
            'update_text' => 'required|string|max:255',
        ]);

        $task->updates()->create([
            'update_text' => $request->update_text,
            'user_id' => $user->id,
        ]);

        return back()->with('success', 'Update added successfully');
    }

    // Update an existing task update
    public function updateUpdate(Task $task, TaskUpdate $update, Request $request)
    {
        $user = auth()->user();
        $this->ensureOfficeOwnership($task);

        if (!in_array($user->user_type, ['ored', 'ms', 'ts'])) {
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
        $user = auth()->user();
        $this->ensureOfficeOwnership($task);

        if (!in_array($user->user_type, ['ored', 'ms', 'ts'])) {
            abort(403);
        }

        $update->delete();

        return back()->with('success', 'Update deleted successfully');
    }
}
