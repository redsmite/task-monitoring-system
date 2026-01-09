<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskDivision extends Model
{
    protected $table = 'task_division';

    protected $fillable = [
        'task_id',
        'division_id'
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function division()
    {
        return $this->belongsTo(Division::class);
    }
}
