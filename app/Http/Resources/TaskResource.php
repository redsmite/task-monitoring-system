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
            'created_at' => $this->created_at ? $this->created_at->format('m/d/Y') : null,

            'priority' => match ($this->priority) {
                'low' => 'Low',
                'regular' => 'Regular',
                'urgent' => 'Urgent',
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
            'divisions' => $this->divisions->map(function ($division) {
                return [
                    'id' => $division->id,
                    'division_name' => $division->division_name,
                    'division_color' => $division->division_color,
                ];
            }),

            'user' => $this->user ? [
                'id' => $this->user->id,
                'first_name' => $this->user->first_name,
                'last_name' => $this->user->last_name,
            ] : null,

            // Latest update for display in tables/lists
            'latest_update' => $this->latestUpdate ? [
                'id' => $this->latestUpdate->id,
                'update_text' => $this->latestUpdate->update_text,
                'created_at' => $this->latestUpdate->created_at ? $this->latestUpdate->created_at->format('m/d/Y H:i') : null,
                'user' => $this->latestUpdate->user ? [
                    'id' => $this->latestUpdate->user->id,
                    'name' => $this->latestUpdate->user->name,
                ] : null,
            ] : null,

            // All updates for history view
            'updates' => $this->whenLoaded('updates', function () {
                return $this->updates->map(function ($update) {
                    return [
                        'id' => $update->id,
                        'update_text' => $update->update_text,
                        'created_at' => $update->created_at ? $update->created_at->format('m/d/Y H:i') : null,
                        'user' => $update->user ? [
                            'id' => $update->user->id,
                            'name' => $update->user->name,
                        ] : null,
                    ];
                });
            }),

            'created_at' => $this->created_at ? $this->created_at->format('m/d/Y') : null,
        ];
    }
}
