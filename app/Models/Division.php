<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
        return $this->hasMany(User::class);
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
