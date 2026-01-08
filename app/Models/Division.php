<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Division extends Model
{
    use HasFactory;

    protected $fillable = [
        'division_name',
        'division_color',
    ];

    // Division <- Employees
    public function employee()
    {
        return $this->hasMany(Employee::class);
    }

    // Division -> Tasks (many-to-many)
    public function tasks()
    {
        return $this->belongsToMany(Task::class, 'task_division', 'division_id', 'task_id')
            ->withTimestamps();
    }

    // Division -> Task (singular for backward compatibility)
    public function task()
    {
        return $this->belongsToMany(Task::class, 'task_division', 'division_id', 'task_id')
            ->withTimestamps()
            ->limit(1);
    }
}
