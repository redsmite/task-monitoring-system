<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Division;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $sort = $request->get('sort', 'asc');
        $search = $request->get('search', '');
        
        // Validate sort order
        if ($sort !== 'asc' && $sort !== 'desc') {
            $sort = 'asc';
        }

        $query = Employee::with('division');

        // Apply search filter
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', '%' . $search . '%')
                  ->orWhere('last_name', 'like', '%' . $search . '%')
                  ->orWhere('position', 'like', '%' . $search . '%')
                  ->orWhereHas('division', function ($divQuery) use ($search) {
                      $divQuery->where('division_name', 'like', '%' . $search . '%');
                  });
            });
        }

        $employees = $query->orderBy('last_name', $sort)->get();
        $divisions = Division::orderBy('division_name', 'asc')->get();

        return Inertia::render('Assignee', [
            'employees' => $employees,
            'divisions' => $divisions,
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
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'division_id' => 'required|exists:divisions,id',
        ]);

        Employee::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'position' => $validated['position'],
            'division_id' => $validated['division_id'],
        ]);

        return back()->with('success', 'Employee added successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Employee $assignee)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Employee $assignee)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Employee $assignee)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'division_id' => 'required|exists:divisions,id',
        ]);

        $assignee->first_name = $validated['first_name'];
        $assignee->last_name = $validated['last_name'];
        $assignee->position = $validated['position'];
        $assignee->division_id = (int) $validated['division_id'];
        $assignee->save();

        return back()->with('success', 'Employee updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Employee $assignee)
    {
        $assignee->delete();

        return back()->with('success', 'Employee deleted successfully!');
    }
}
