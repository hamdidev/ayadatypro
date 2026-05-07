<?php
// app/Http/Controllers/AvatarController.php
// Serves private disk avatars via signed URL
// Referenced in HandleInertiaRequests::formatAvatarUrl()

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AvatarController extends Controller
{
    /**
     * Serve a private avatar file.
     * Route must have ->middleware('signed') to validate the signed URL.
     *
     * Route::get('/avatar/{user}', AvatarController::class)
     *      ->middleware('signed')
     *      ->name('avatar.show');
     */
    public function __invoke(Request $request, User $user): StreamedResponse
    {
        abort_unless($request->hasValidSignature(), 403);

        $path = $user->avatar;

        abort_if(! $path || ! Storage::disk('private')->exists($path), 404);

        return Storage::disk('private')->response($path, null, [
            'Cache-Control' => 'private, max-age=3600',
        ]);
    }
}
