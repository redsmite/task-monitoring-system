<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Division extends Model
{
    use HasFactory;

    protected $fillable = [
        'division_name',
    ];

    // Division <- Employees
    public function employee()
    {
        return $this->hasMany(Employee::class);
    }

    // Division <- Tasks
    public function task()
    {
        return $this->hasMany(Task::class);
    }
}
