<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BranchController extends Controller
{
    public function index(Request $request): Response
    {
        $clinic = $request->user()->clinic;

        return Inertia::render('Branches/Index', [
            'branches' => $clinic->branches()
                ->withCount(['appointments', 'users'])
                ->orderByDesc('is_main')
                ->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $clinic = $request->user()->clinic;

        // Chain plan only
        if ($clinic->subscription_plan !== 'chain' && $clinic->branches()->count() >= 1) {
            return back()->with('error', 'تتطلب إضافة فروع الاشتراك في خطة السلسلة.');
        }

        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'phone'    => 'nullable|string|max:20',
            'address'  => 'nullable|string|max:500',
            'city'     => 'nullable|string|max:100',
            'timezone' => 'nullable|string|timezone',
        ]);

        Branch::create([
            ...$data,
            'clinic_id' => $clinic->id,
            'slug'      => Str::slug($data['name']) . '-' . Str::random(4),
            'timezone'  => $data['timezone'] ?? $clinic->timezone,
            'is_main'   => false,
            'is_active' => true,
        ]);

        return redirect()->route('branches.index')
            ->with('success', 'تم إنشاء الفرع بنجاح.');
    }

    public function update(Request $request, Branch $branch): RedirectResponse
    {
        $this->authorize('update', $branch);

        $data = $request->validate([
            'name'      => 'required|string|max:255',
            'phone'     => 'nullable|string|max:20',
            'address'   => 'nullable|string|max:500',
            'city'      => 'nullable|string|max:100',
            'timezone'  => 'nullable|string|timezone',
            'is_active' => 'boolean',
        ]);

        $branch->update($data);

        return back()->with('success', 'تم تحديث الفرع.');
    }

    public function destroy(Branch $branch): RedirectResponse
    {
        $this->authorize('delete', $branch);

        if ($branch->is_main) {
            return back()->with('error', 'لا يمكن حذف الفرع الرئيسي.');
        }

        $branch->delete();

        return redirect()->route('branches.index')
            ->with('success', 'تم حذف الفرع.');
    }
}
