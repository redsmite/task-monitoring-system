<?php

namespace App\Http\Controllers;

use App\Models\Division;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DivisionsController extends Controller
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

        $query = Division::query();

        // Apply search filter
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('division_name', 'like', '%' . $search . '%')
                  ->orWhere('division_color', 'like', '%' . $search . '%');
            });
        }

        $divisions = $query->orderBy('division_name', $sort)->get();

        return Inertia::render('Division', [
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
            'division_name' => 'required|string|max:255|unique:divisions,division_name',
            'division_color' => 'required|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        Division::create([
            'division_name' => $validated['division_name'],
            'division_color' => $validated['division_color'],
        ]);

        return back()->with('success', 'Division added successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Division $division)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Division $division)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Division $division)
    {
        $validated = $request->validate([
            'division_name' => 'required|string|max:255|unique:divisions,division_name,' . $division->id,
            'division_color' => 'required|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $division->update([
            'division_name' => $validated['division_name'],
            'division_color' => $validated['division_color'],
        ]);

        return back()->with('success', 'Division updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Division $division)
    {
        $division->delete();

        return back()->with('success', 'Division deleted successfully!');
    }
}
