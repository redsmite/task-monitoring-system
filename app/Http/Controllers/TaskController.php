<?php

namespace App\Http\Controllers;

use App\Http\Resources\TaskResource;
use App\Models\Activity;
use App\Models\Division;
use App\Models\Employee;
use App\Models\Task;
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
        $employees = Employee::orderBy('last_name', 'asc')->get();

        // Get page numbers for each table separately
        $taskAllPage = $request->get('task_all_page', 1);
        $completedPage = $request->get('completed_page', 1);

        // Get search parameters for each table
        $taskAllSearch = $request->get('task_all_search', '');
        $completedSearch = $request->get('completed_search', '');

        // Get sort order for each table (asc or desc, default to desc)
        $taskAllSort = $request->get('task_all_sort', 'desc');
        $completedSort = $request->get('completed_sort', 'desc');

        // Validate sort order
        $taskAllSort = in_array($taskAllSort, ['asc', 'desc']) ? $taskAllSort : 'desc';
        $completedSort = in_array($completedSort, ['asc', 'desc']) ? $completedSort : 'desc';

        // Helper function to apply search
        $applySearch = function ($query, $search) {
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%')
                        ->orWhere('last_action', 'like', '%' . $search . '%')
                        ->orWhereHas('employee', function ($empQuery) use ($search) {
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

        $taskAll = $applySearch(
            Task::with('divisions', 'employee')
                ->whereIn('status', ['not_started', 'in_progress'])
                ->orderBy('created_at', $taskAllSort),
            $taskAllSearch
        )->paginate(15, ['*'], 'task_all_page', $taskAllPage);

        $completed = $applySearch(
            Task::with('divisions', 'employee')
                ->where('status', 'completed')
                ->orderBy('created_at', $completedSort),
            $completedSearch
        )->paginate(15, ['*'], 'completed_page', $completedPage);

        return Inertia::render('Task', [
            'divisions_data' => $divisions,
            'employees_data' => $employees,

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

        // Normalize due_date to avoid timezone issues - set to start of day
        $dueDate = null;
        if (!empty($validated['due_date'])) {
            try {
                // Parse the date and set to start of day to avoid timezone shifts
                $dueDate = \Carbon\Carbon::parse($validated['due_date'])->startOfDay();
            } catch (\Exception $e) {
                $dueDate = null;
            }
        }

        $task = Task::create([
            'name' => $validated['task_name'],
            'employee_id' => $employeeId,
            'last_action' => $validated['last_action'] ?? null,
            'status' => $validated['status'] ?? null,
            'priority' => $validated['priority'] ?? null,
            'due_date' => $dueDate,
            'description' => $validated['description'] ?? null,
        ]);

        // Attach divisions to task
        if (!empty($divisionIds)) {
            $task->divisions()->sync($divisionIds);
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
        //
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
            $request->has('due_date');

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

        $validated = $request->validate([
            'task_name' => 'sometimes|required|string|max:255',
            'assignee' => 'sometimes|nullable|string|max:255',
            'division' => 'sometimes|nullable', // Can be string, array, or null
            'last_action' => 'sometimes|nullable|string|max:255',
            'status' => 'sometimes|nullable|string|max:255',
            'priority' => 'sometimes|nullable|string|max:255',
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

        // Prepare new values (excluding division_id)
        // Normalize due_date to avoid timezone issues - set to start of day in app timezone
        $dueDate = null;
        if (!empty($validated['due_date'])) {
            try {
                // Parse the date and set to start of day to avoid timezone shifts
                $dueDate = \Carbon\Carbon::parse($validated['due_date'])->startOfDay();
            } catch (\Exception $e) {
                $dueDate = null;
            }
        }

        $newValues = [
            'name' => $validated['task_name'],
            'employee_id' => $employeeId,
            'last_action' => $validated['last_action'] ?? null,
            'status' => $validated['status'] ?? null,
            'priority' => $validated['priority'] ?? null,
            'due_date' => $dueDate,
            'description' => $validated['description'] ?? null,
        ];

        // Track changes by comparing original with new values
        $changes = [];
        foreach ($newValues as $key => $newValue) {
            $originalValue = $original[$key] ?? null;

            // Special handling for due_date - normalize dates for comparison
            if ($key === 'due_date') {
                try {
                    // Normalize both dates to Y-m-d format for comparison (ignoring time)
                    $originalDate = null;
                    $newDate = null;

                    if ($originalValue) {
                        $originalDate = is_string($originalValue)
                            ? \Carbon\Carbon::parse($originalValue)->format('Y-m-d')
                            : $originalValue->format('Y-m-d');
                    }

                    if ($newValue) {
                        $newDate = \Carbon\Carbon::parse($newValue)->format('Y-m-d');
                    }

                    // Only track if dates are actually different
                    if ($originalDate !== $newDate) {
                        $fromFormatted = $originalValue
                            ? (is_string($originalValue)
                                ? \Carbon\Carbon::parse($originalValue)->format('m/d/Y')
                                : $originalValue->format('m/d/Y'))
                            : 'N/A';
                        $toFormatted = $newValue
                            ? \Carbon\Carbon::parse($newValue)->format('m/d/Y')
                            : 'N/A';

                        $changes[$key] = [
                            'from' => $fromFormatted,
                            'to' => $toFormatted,
                        ];
                    }
                } catch (\Exception $e) {
                    // If date parsing fails, fall back to regular comparison
                    if ($originalValue != $newValue) {
                        $changes[$key] = [
                            'from' => $originalValue ?? 'N/A',
                            'to' => $newValue ?? 'N/A',
                        ];
                    }
                }
                continue;
            }

            // Compare values (handle null comparisons)
            if (
                $originalValue != $newValue ||
                ($originalValue === null && $newValue !== null) ||
                ($originalValue !== null && $newValue === null)
            ) {

                // Resolve IDs to names for display
                $fromValue = $originalValue;
                $toValue = $newValue;
                $displayKey = $key;

                if ($key === 'employee_id') {
                    $displayKey = 'assignee';
                    // Resolve original employee name
                    if ($originalValue) {
                        $originalEmployee = Employee::find($originalValue);
                        $fromValue = $originalEmployee ? trim($originalEmployee->first_name . ' ' . $originalEmployee->last_name) : 'N/A';
                    } else {
                        $fromValue = 'N/A';
                    }

                    // Resolve new employee name
                    if ($newValue) {
                        $newEmployee = Employee::find($newValue);
                        $toValue = $newEmployee ? trim($newEmployee->first_name . ' ' . $newEmployee->last_name) : 'N/A';
                    } else {
                        $toValue = 'N/A';
                    }
                }

                $changes[$displayKey] = [
                    'from' => $fromValue,
                    'to' => $toValue,
                ];
            }
        }

        // Handle division changes separately
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

        $task->update($newValues);

        // Sync divisions
        $task->divisions()->sync($divisionIds);

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
}
