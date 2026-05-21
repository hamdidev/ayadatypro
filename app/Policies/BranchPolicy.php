<?php

namespace App\Policies;

use App\Models\Branch;
use App\Models\User;

class BranchPolicy
{
    public function update(User $user, Branch $branch): bool
    {
        return $user->clinic_id === $branch->clinic_id
            && $user->role === 'owner';
    }

    public function delete(User $user, Branch $branch): bool
    {
        return $this->update($user, $branch) && ! $branch->is_main;
    }
}
