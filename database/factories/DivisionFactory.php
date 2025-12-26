<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Division>
 */
class DivisionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $divisions = [
            "Impo",
            "Manda",
            "GMS",
            "MBSCMO",
            "PRCMO",
            "DENR",
            "COA",
            "MEO",
            "CDD",
            "ED",
            "SMD",
            "LPDD",
            "FD",
            "ARD",
            "AD",
            "ORED",
            "LD",
            "RD",
        ];

        $colors = [
            "#FF6B6B", // Impo
            "#4ECDC4", // Manda
            "#556270", // GMS
            "#C7F464", // MBSCMO
            "#FFCC5C", // PRCMO
            "#88D8B0", // DENR
            "#96CEB4", // COA
            "#D9534F", // MEO
            "#5BC0DE", // CDD
            "#F0AD4E", // ED
            "#A569BD", // SMD
            "#1ABC9C", // LPDD
            "#3498DB", // FD
            "#2ECC71", // ARD
            "#9B59B6", // AD
            "#E74C3C", // ORED
            "#F39C12", // LD
            "#16A085", // RD
        ];

        return [
            'division_name' => $this->faker->randomElement($divisions),
            'division_color' => $this->faker->randomElement($colors)
        ];
    }
}
