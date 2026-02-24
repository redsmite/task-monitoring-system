<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'last_action',
        'status',
        'priority',
        'originating_office',
        'due_date',
        'created_at',
        'updated_at',
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

    // Task -> Division
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
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'task_user')
            ->withTimestamps();
    }


    // Task -> Updates (History)
    public function updates()
    {
        return $this->hasMany(TaskUpdate::class)->orderBy('created_at', 'desc');
    }

    // Task -> Latest Update
    public function latestUpdate()
    {
        return $this->hasOne(TaskUpdate::class)->latestOfMany();
    }
}
