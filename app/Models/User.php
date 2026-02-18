<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'position',
        'division_id',
        'email',
        'user_type',
        'external_user_id',
    ];

    protected $hidden = [
        // nothing needed here anymore
    ];

    protected function casts(): array
    {
        return [
            // no casts needed now
        ];
    }

    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    public function tasks()
    {
        return $this->belongsToMany(Task::class, 'task_user')->withTimestamps();
    }
}
