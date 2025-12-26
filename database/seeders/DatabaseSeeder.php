<?php

namespace Database\Seeders;

use App\Models\Division;
use App\Models\Employee;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

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
            "PMD",
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
            "#E67E22", // PMD
        ];

        foreach ($divisions as $index => $name) {
            Division::create([
                'division_name' => $name,
                'division_color' => $colors[$index]
            ]);
        }

        Employee::factory(7)->create();

    }
}
