<?php

namespace App\Http\Controllers;

use App\Http\Resources\TaskResource;
use App\Models\Activity;
use App\Models\Division;
use App\Models\User;
use App\Models\Task;
use App\Models\TaskUpdate;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $divisions = Division::all();
        $employees = User::orderBy('last_name', 'asc')->get();

        // Get page numbers for each table separately
        $taskAllPage = $request->get('task_all_page', 1);
        $completedPage = $request->get('completed_page', 1);

        // Get search parameters for each table
        $taskAllSearch = $request->get('task_all_search', '');
        $completedSearch = $request->get('completed_search', '');

        // Get status filter for task_all
        $taskAllStatusFilter = $request->get('task_all_status', '');

        // Get sort order for each table (asc or desc, default to desc)
        $taskAllSort = $request->get('task_all_sort', 'desc');
        $completedSort = $request->get('completed_sort', 'desc');

        // Validate sort order
        $taskAllSort = in_array($taskAllSort, ['asc', 'desc']) ? $taskAllSort : 'desc';
        $completedSort = in_array($completedSort, ['asc', 'desc']) ? $completedSort : 'desc';

        // Validate status filter (treat 'all' as empty/no filter)
        $taskAllStatusFilter = in_array($taskAllStatusFilter, ['in_progress', 'not_started', 'all', '']) ? $taskAllStatusFilter : '';
        if ($taskAllStatusFilter === 'all') {
            $taskAllStatusFilter = '';
        }

        // Helper function to apply search
        $applySearch = function ($query, $search) {
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%')
                        ->orWhere('last_action', 'like', '%' . $search . '%')
                        ->orWhereHas('updates', function ($updateQuery) use ($search) {
                            $updateQuery->where('update_text', 'like', '%' . $search . '%');
                        })
                        ->orWhereHas('user', function ($empQuery) use ($search) {
                            $empQuery->where('first_name', 'like', '%' . $search . '%')
                                ->orWhere('last_name', 'like', '%' . $search . '%');
                        })
                        ->orWhereHas('divisions', function ($divQuery) use ($search) {
                            $divQuery->where('division_name', 'like', '%' . $search . '%');
                        });
                });
            }
            return $query;
        };

        // Build taskAll query
        $taskAllQuery = Task::with('divisions', 'user', 'latestUpdate')
            ->whereIn('status', ['not_started', 'in_progress']);
        
        // Apply status filter if provided
        if (!empty($taskAllStatusFilter)) {
            $taskAllQuery->where('status', $taskAllStatusFilter);
        }
        
        $taskAll = $applySearch(
            $taskAllQuery->orderBy('created_at', $taskAllSort),
            $taskAllSearch
        )->paginate(15, ['*'], 'task_all_page', $taskAllPage);

        $completed = $applySearch(
            Task::with('divisions', 'user', 'latestUpdate')
                ->where('status', 'completed')
                ->orderBy('created_at', $completedSort),
            $completedSearch
        )->paginate(15, ['*'], 'completed_page', $completedPage);

        return Inertia::render('Task', [
            'userRole' => auth()->user()->user_type, // 'admin' or 'user'
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

            'search_params' => [
                'task_all_search' => $taskAllSearch,
                'completed_search' => $completedSearch,
            ],
            'sort_params' => [
                'task_all_sort' => $taskAllSort,
                'completed_sort' => $completedSort,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'task_name' => 'required|string|max:255',
            'assignee' => 'required|string|max:255',
            'division' => 'required', // Can be string or array
            'last_action' => 'nullable|string|max:255',
            'status' => 'required|string|max:255',
            'priority' => 'nullable|string|max:255',
            'created_at' => 'sometimes|nullable|date',// 👈 add this
            'due_date' => 'nullable|date',
            'description' => 'nullable|string',
        ]);

        $employeeId = !empty($validated['assignee'])
            ? intval($validated['assignee'])
            : null;

        // Handle divisions - can be single value or array
        $divisionIds = [];
        if (!empty($validated['division'])) {
            if (is_array($validated['division'])) {
                $divisionIds = array_filter(array_map('intval', $validated['division']));
            } else {
                $divisionIds = [intval($validated['division'])];
            }
        }

        // Normalize dates
        $dueDate = !empty($validated['due_date'])
            ? \Carbon\Carbon::parse($validated['due_date'])->startOfDay()
            : null;

        $createdAt = !empty($validated['created_at'])
            ? \Carbon\Carbon::parse($validated['created_at'])->startOfDay()
            : now(); // fallback to current time if not provided

        $task = Task::create([
            'name' => $validated['task_name'],
            'user_id' => $employeeId,
            'last_action' => $validated['last_action'] ?? null,
            'status' => $validated['status'] ?? null,
            'priority' => $validated['priority'] ?? null,
            'due_date' => $dueDate,
            'updated_at' => $createdAt, // optional, to keep timestamps consistent
            'description' => $validated['description'] ?? null,
            'created_at' => !empty($validated['created_at']) 
                ? \Carbon\Carbon::parse($validated['created_at'])->startOfDay() 
                : now(),
        ]);

        // Attach divisions to task
        if (!empty($divisionIds)) {
            $task->divisions()->sync($divisionIds);
        }

        // Create initial task update if last_action is provided
        if (!empty($validated['last_action'])) {
            TaskUpdate::create([
                'task_id' => $task->id,
                'update_text' => $validated['last_action'],
                'user_id' => Auth::id(),
            ]);
        }

        // Log activity
        Activity::create([
            'action' => 'created',
            'model_type' => Task::class,
            'model_id' => $task->id,
            'description' => "Task '{$task->name}' was created",
            'user_id' => Auth::id(),
        ]);

        return back()->with('success', 'Task added successfully!');
    }


    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {
        $task->load(['divisions', 'user', 'updates.user']);
        
        return response()->json([
            'task' => new TaskResource($task),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Task $task)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task)
    {
        // Check if ONLY description is being updated (no other fields present)
        $hasOtherFields = $request->has('task_name') ||
            $request->has('assignee') ||
            $request->has('division') ||
            $request->has('last_action') ||
            $request->has('status') ||
            $request->has('priority') ||
            $request->has('due_date') ||
            $request->has('created_at'); // 👈 include created_at

        if ($request->has('description') && !$hasOtherFields) {
            $validated = $request->validate([
                'description' => 'nullable|string',
            ]);

            $originalDescription = $task->description;
            $newDescription = $validated['description'] ?? null;

            $task->update([
                'description' => $newDescription,
            ]);

            // Log activity for description update
            Activity::create([
                'action' => 'updated',
                'model_type' => Task::class,
                'model_id' => $task->id,
                'description' => "Task '{$task->name}' description was updated",
                'changes' => [
                    'description' => [
                        'from' => $originalDescription ?? 'N/A',
                        'to' => $newDescription ?? 'N/A',
                    ],
                ],
                'user_id' => Auth::id(),
            ]);

            return back();
        }

        // Validate all fields including created_at
        $validated = $request->validate([
            'task_name' => 'sometimes|required|string|max:255',
            'assignee' => 'sometimes|nullable|string|max:255',
            'division' => 'sometimes|nullable', // Can be string, array, or null
            'last_action' => 'sometimes|nullable|string|max:255',
            'status' => 'sometimes|nullable|string|max:255',
            'priority' => 'sometimes|nullable|string|max:255',
            'created_at' => 'sometimes|nullable|date', // 👈 added
            'due_date' => 'sometimes|nullable|date',
            'description' => 'sometimes|nullable|string',
        ]);

        $employeeId = !empty($validated['assignee'])
            ? intval($validated['assignee'])
            : null;

        // Handle divisions - can be single value, array, or null
        $divisionIds = [];
        if (!empty($validated['division'])) {
            if (is_array($validated['division'])) {
                $divisionIds = array_filter(array_map('intval', $validated['division']));
            } else {
                $divisionIds = [intval($validated['division'])];
            }
        }

        // Get original values for change tracking
        $original = $task->getOriginal();
        $originalDivisionIds = $task->divisions->pluck('id')->toArray();

        // Normalize due_date and created_at to avoid timezone issues - set to start of day
        $dueDate = !empty($validated['due_date'])
            ? \Carbon\Carbon::parse($validated['due_date'])->startOfDay()
            : $task->due_date;

        $createdAt = !empty($validated['created_at'])
            ? \Carbon\Carbon::parse($validated['created_at'])->startOfDay()
            : $task->created_at;

        // Prepare new values
        $newValues = [
            'name' => $validated['task_name'],
            'user_id' => $employeeId,
            'last_action' => $validated['last_action'] ?? null,
            'status' => $validated['status'] ?? null,
            'priority' => $validated['priority'] ?? null,
            'due_date' => $dueDate,
            'description' => $validated['description'] ?? null,
            'created_at' => !empty($validated['created_at']) 
                ? \Carbon\Carbon::parse($validated['created_at'])->startOfDay() 
                : $task->created_at, // keep existing if not changed
        ];


        // Track changes
        $changes = [];

        foreach ($newValues as $key => $newValue) {
            $originalValue = $original[$key] ?? null;

            // Special handling for dates
            if (in_array($key, ['due_date', 'created_at'])) {
                $originalDate = $originalValue ? \Carbon\Carbon::parse($originalValue)->format('Y-m-d') : null;
                $newDate = $newValue ? \Carbon\Carbon::parse($newValue)->format('Y-m-d') : null;

                if ($originalDate !== $newDate) {
                    $changes[$key] = [
                        'from' => $originalValue ? \Carbon\Carbon::parse($originalValue)->format('m/d/Y') : 'N/A',
                        'to' => $newValue ? \Carbon\Carbon::parse($newValue)->format('m/d/Y') : 'N/A',
                    ];
                }
                continue;
            }

            if ($key === 'user_id') {
                $fromValue = $originalValue ? User::find($originalValue)->full_name ?? 'N/A' : 'N/A';
                $toValue = $newValue ? User::find($newValue)->full_name ?? 'N/A' : 'N/A';
                if ($fromValue !== $toValue) {
                    $changes['assignee'] = ['from' => $fromValue, 'to' => $toValue];
                }
                continue;
            }

            if ($originalValue != $newValue) {
                $changes[$key] = [
                    'from' => $originalValue ?? 'N/A',
                    'to' => $newValue ?? 'N/A',
                ];
            }
        }

        // Handle division changes
        sort($originalDivisionIds);
        sort($divisionIds);
        if ($originalDivisionIds !== $divisionIds) {
            $originalDivisionNames = Division::whereIn('id', $originalDivisionIds)->pluck('division_name')->toArray();
            $newDivisionNames = Division::whereIn('id', $divisionIds)->pluck('division_name')->toArray();
            $changes['division'] = [
                'from' => !empty($originalDivisionNames) ? implode(', ', $originalDivisionNames) : 'N/A',
                'to' => !empty($newDivisionNames) ? implode(', ', $newDivisionNames) : 'N/A',
            ];
        }

        // Update task
        $task->update($newValues);

        // Sync divisions
        $task->divisions()->sync($divisionIds);

        // Handle last_action update
        if (!empty($validated['last_action'])) {
            $latestUpdate = $task->latestUpdate;
            if ($latestUpdate) {
                if ($latestUpdate->update_text !== $validated['last_action']) {
                    $latestUpdate->update(['update_text' => $validated['last_action']]);
                }
            } else {
                TaskUpdate::create([
                    'task_id' => $task->id,
                    'update_text' => $validated['last_action'],
                    'user_id' => Auth::id(),
                ]);
            }
        }

        // Log activity
        Activity::create([
            'action' => 'updated',
            'model_type' => Task::class,
            'model_id' => $task->id,
            'description' => "Task '{$task->name}' was updated",
            'changes' => !empty($changes) ? $changes : null,
            'user_id' => Auth::id(),
        ]);

        return back()->with('success', 'Task updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        $taskName = $task->name;
        $taskId = $task->id;

        $task->delete();

        // Log activity
        Activity::create([
            'action' => 'deleted',
            'model_type' => Task::class,
            'model_id' => $taskId,
            'description' => "Task '{$taskName}' was deleted",
            'user_id' => Auth::id(),
        ]);

        return redirect()->route('task.index')->with('success', 'Task deleted!');
    }

    /**
     * Store a new task update.
     */
    public function storeUpdate(Request $request, Task $task)
    {
        $validated = $request->validate([
            'update_text' => 'required|string|max:1000',
        ]);

        $update = TaskUpdate::create([
            'task_id' => $task->id,
            'update_text' => $validated['update_text'],
            'user_id' => Auth::id(),
        ]);

        // Update last_action for backward compatibility
        $task->update(['last_action' => $validated['update_text']]);

        // Log activity
        Activity::create([
            'action' => 'created',
            'model_type' => TaskUpdate::class,
            'model_id' => $update->id,
            'description' => "Update added to task '{$task->name}'",
            'user_id' => Auth::id(),
        ]);

        return back()->with('success', 'Update added successfully!');
    }

    /**
     * Update an existing task update.
     */
    public function updateUpdate(Request $request, Task $task, TaskUpdate $update)
    {
        // Verify the update belongs to the task
        if ($update->task_id !== $task->id) {
            abort(403, 'Update does not belong to this task');
        }

        $validated = $request->validate([
            'update_text' => 'required|string|max:1000',
        ]);

        $update->update([
            'update_text' => $validated['update_text'],
        ]);

        // Update last_action if this is the latest update
        $latestUpdate = $task->latestUpdate;
        if ($latestUpdate && $latestUpdate->id === $update->id) {
            $task->update(['last_action' => $validated['update_text']]);
        }

        // Log activity
        Activity::create([
            'action' => 'updated',
            'model_type' => TaskUpdate::class,
            'model_id' => $update->id,
            'description' => "Update edited for task '{$task->name}'",
            'user_id' => Auth::id(),
        ]);

        return back()->with('success', 'Update updated successfully!');
    }

    /**
     * Delete a task update.
     */
    public function destroyUpdate(Task $task, TaskUpdate $update)
    {
        // Verify the update belongs to the task
        if ($update->task_id !== $task->id) {
            abort(403, 'Update does not belong to this task');
        }

        $update->delete();

        // Update last_action to the new latest update if exists
        $latestUpdate = $task->latestUpdate;
        $task->update(['last_action' => $latestUpdate ? $latestUpdate->update_text : null]);

        // Log activity
        Activity::create([
            'action' => 'deleted',
            'model_type' => TaskUpdate::class,
            'model_id' => $update->id,
            'description' => "Update deleted from task '{$task->name}'",
            'user_id' => Auth::id(),
        ]);

        return back()->with('success', 'Update deleted successfully!');
    }
}
