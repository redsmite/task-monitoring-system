<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            // Normal
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'last_action' => $this->last_action,

            // Formatted
            'due_date' => $this->due_date ? $this->due_date->format('m/d/Y') : null,

            'priority' => match ($this->priority) {
                'low' => 'Low',
                'medium' => 'Medium',
                'high' => 'High',
                default => $this->priority,
            },

            'status' => match ($this->status) {
                'not_started' => 'Not Started',
                'in_progress' => 'In Progress',
                'completed' => 'Completed',
                default => $this->status,
            },

            // Relationships
            'division' => $this->division ? [
                'id' => $this->division->id,
                'division_name' => $this->division->division_name,
                'division_color' => $this->division->division_color,
            ] : null,

            'employee' => $this->employee ? [
                'id' => $this->employee->id,
                'first_name' => $this->employee->first_name,
                'last_name' => $this->employee->last_name,
            ] : null,

            'created_at' => $this->created_at ? $this->created_at->format('m/d/Y') : null,
        ];
    }
}
