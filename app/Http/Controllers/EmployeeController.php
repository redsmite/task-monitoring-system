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
        
        // Validate sort order
        if ($sort !== 'asc' && $sort !== 'desc') {
            $sort = 'asc';
        }

        $employees = Employee::with('division')->orderBy('last_name', $sort)->get();
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
    public function show(Employee $employee)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Employee $employee)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'division_id' => 'required|exists:divisions,id',
        ]);

        $employee->update([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'position' => $validated['position'],
            'division_id' => $validated['division_id'],
        ]);

        return back()->with('success', 'Employee updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Employee $employee)
    {
        $employee->delete();

        return back()->with('success', 'Employee deleted successfully!');
    }
}
