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
        //User::factory(1)->create();

        $divisions = [
            "Planning and Management Division",
            "Legal Division",
            "Office of the Regional Executive Director",
            "Admin Division",
            "Office of the Assistant Regional Director",
            "Finance Division",
            "Licenses, Patents, and Deeds Division",
            "Surveys and Mapping Division",
            "Enforcement Division",
            "Conservation and Development Division",
            "Metropolitan Environmental Office",
            "Commission on Audit",
            "Department of Environment and Natural Resources",
            "Pasig River Coordinating and Management Office",
            "Manila Bay Site Coordinating and Management Office",
            "General Management and Supervision",
            "Mandatories",
            "Impositions",
        ];

        $colors = [
            "#FF6B6B", // PMD
            "#4ECDC4", // LD
            "#bd3737", // ORED
            "#C7F464", // AD
            "#FFCC5C", // ARD
            "#88D8B0", // FD
            "#96CEB4", // LPDD
            "#D9534F", // SMD
            "#5BC0DE", // ED
            "#F0AD4E", // CDD
            "#A569BD", // MEO
            "#1ABC9C", // COA
            "#3498DB", // DENR
            "#2ECC71", // PRCMO
            "#9B59B6", // MBSCMO
            "#E74C3C", // GMS
            "#F39C12", // MANDATORIES
            "#16A085", // IMPOSITIONS
            "#E67E22", // OTHERS
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
