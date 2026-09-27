<?php

namespace App\Http\Controllers;

use App\Models\DataProfiling;
use App\Models\Opd;
use App\Models\Tiket;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $role = $request->user()->role;
        $data = ['role' => $role, 'counts' => ['opd' => Opd::count(), 'users' => User::count(), 'profiling' => DataProfiling::count(), 'tiket' => Tiket::count(), 'tiket_baru' => Tiket::where('status', 'baru')->count(), 'profiling_diajukan' => DataProfiling::where('status_verifikasi', 'diajukan')->count()]];
        $page = $role === 'admin' ? 'Admin/Dashboard' : ($role === 'opd' ? 'Opd/Dashboard' : 'Vendor/Dashboard');
        return Inertia::render($page, $data);
    }
}
