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
        'division_id',
        'last_action',
        'status',
        'priority',
        'due_date'
    ];

    protected $casts = [
        'due_date' => 'datetime',
    ];


    // Task -> Division
    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    // Task -> Employee
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
