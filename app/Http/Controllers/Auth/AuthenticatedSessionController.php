<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Opd;
use App\Models\SpeedTest;
use App\Models\Tiket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use Inertia\Inertia;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create()
    {
        $speedTestCount = SpeedTest::query()->count();

        return Inertia::render('Admin/Opd/Index', [
            'landingStats' => [
                'opds' => Opd::query()->count(),
                'speedTestCompliance' => $speedTestCount === 0
                    ? null
                    : (int) round(
                        SpeedTest::query()->where('hasil', 'sesuai')->count()
                            / $speedTestCount * 100
                    ),
                'resolvedTickets' => Tiket::query()->where('status', 'selesai')->count(),
            ],
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse|JsonResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $dashboardRoute = match (Auth::user()->role) {
            'admin' => 'admin.dashboard',
            'opd' => 'opd.dashboard',
            'pihak_ketiga' => 'vendor.dashboard',
        };

        if ($request->expectsJson()) {
            return response()->json([
                'role' => Auth::user()->role,
                'name' => Auth::user()->nama,
                'dashboard_url' => route($dashboardRoute),
            ]);
        }
        $user = Auth::user();

        return redirect()->intended(route($dashboardRoute));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
