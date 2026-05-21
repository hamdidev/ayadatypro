<?php

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\Clinic;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class SeedMainBranches extends Command
{
    protected $signature   = 'branches:seed-main';
    protected $description = 'Create a main branch for every existing clinic';

    public function handle(): void
    {
        Clinic::whereDoesntHave('branches')->each(function (Clinic $clinic) {
            Branch::create([
                'clinic_id' => $clinic->id,
                'name'      => $clinic->name,
                'slug'      => Str::slug($clinic->name) . '-main',
                'phone'     => $clinic->phone,
                'address'   => $clinic->address,
                'timezone'  => $clinic->timezone ?? 'Asia/Riyadh',
                'is_main'   => true,
                'is_active' => true,
            ]);
        });

        $this->info('Main branches seeded.');
    }
}
