<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'position',
        'division_id'
    ];

    // Employee -> Division
    public function division() 
    {
        return $this->belongsTo(Division::class);
    }

    // Employee <- Tasks
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
