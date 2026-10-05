<?php

namespace App\Http\Controllers;

use App\Models\DataProfiling;
use App\Models\Opd;
use App\Models\PihakKetiga;
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
        $profilings = DataProfiling::query();
        $tickets = Tiket::query();
        if ($role === 'opd') {
            $profilings->where('opd_id', $request->user()->opd_id);
            $tickets->whereHas('kendala.profiling', fn ($query) => $query->where('opd_id', $request->user()->opd_id));
        }

        $data = [
            'role' => $role === 'pihak_ketiga' ? 'vendor' : $role,
            'userName' => $request->user()->nama,
            'opdName' => $request->user()->opd?->nama_opd,
            'userId' => $request->user()->id,
            'opdId' => $request->user()->opd_id,
            'opds' => $role === 'admin'
                ? Opd::with(['koneksiInternet', 'dataProfiling'])->orderBy('nama_opd')->get()
                : [],
            'vendors' => $role === 'admin'
                ? PihakKetiga::orderBy('nama_vendor')->get(['id', 'nama_vendor'])
                : [],
            'profilings' => (clone $profilings)
                ->with(['opd.koneksiInternet', 'aplikasi', 'speedTest', 'kendala.tiket'])
                ->latest()
                ->get(),
            'tickets' => (clone $tickets)
                ->with(['kendala.profiling.opd', 'pihakKetiga', 'riwayat.user'])
                ->latest()
                ->get(),
            'counts' => [
                'opd' => Opd::count(),
                'users' => User::count(),
                'profiling' => (clone $profilings)->count(),
                'tiket' => (clone $tickets)->count(),
                'tiket_baru' => (clone $tickets)->where('status', 'baru')->count(),
                'profiling_diajukan' => (clone $profilings)->where('status_verifikasi', 'diajukan')->count(),
            ],
        ];

        return Inertia::render('Admin/Opd/Index', $data);
    }
}
