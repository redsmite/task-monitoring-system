<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'employee_id',
        'last_action',
        'status',
        'priority',
        'due_date'
    ];

    protected $casts = [
        'due_date' => 'datetime',
    ];

    // Task -> Divisions (many-to-many)
    public function divisions()
    {
        return $this->belongsToMany(Division::class, 'task_division', 'task_id', 'division_id')
            ->withTimestamps();
    }

    // Task -> Division (singular for backward compatibility)
    // Returns the first division from the many-to-many relationship
    // Note: Use divisions() for multiple divisions, division() for backward compatibility
    public function getDivisionAttribute()
    {
        // If divisions are already loaded, return the first one
        if ($this->relationLoaded('divisions')) {
            return $this->getRelation('divisions')->first();
        }
        // Otherwise, lazy load the first division
        return $this->divisions()->first();
    }

    // Task -> Employee
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
