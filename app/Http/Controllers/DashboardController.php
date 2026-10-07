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
        } elseif ($role === 'pihak_ketiga') {
            if ($request->user()->pihak_ketiga_id) {
                $tickets->where('pihak_ketiga_id', $request->user()->pihak_ketiga_id);
            } else {
                $tickets->whereRaw('1 = 0');
            }
        }

        $data = [
            'role' => $role === 'pihak_ketiga' ? 'vendor' : $role,
            'userName' => $request->user()->nama,
            'opdName' => $request->user()->opd?->nama_opd,
            'vendorName' => $request->user()->pihakKetiga?->nama_vendor,
            'userId' => $request->user()->id,
            'opdId' => $request->user()->opd_id,
            'opds' => $role === 'admin'
                ? Opd::with(['koneksiInternet', 'dataProfiling'])->orderBy('nama_opd')->get()
                : [],
            'vendors' => $role === 'admin'
                ? PihakKetiga::orderBy('nama_vendor')->get(['id', 'nama_vendor'])
                : [],
            'users' => $role === 'admin'
                ? User::with(['opd:id,nama_opd', 'pihakKetiga:id,nama_vendor'])
                    ->orderBy('nama')
                    ->get(['id', 'nama', 'email', 'role', 'opd_id', 'pihak_ketiga_id', 'status'])
                : [],
            'profilings' => (clone $profilings)
                ->with(['opd.koneksiInternet', 'aplikasi', 'speedTest', 'kendala.tiket'])
                ->latest()
                ->get(),
            'reportRows' => $role === 'admin'
                ? (DataProfiling::query()
                    ->with(['opd.koneksiInternet', 'speedTest', 'kendala.tiket'])
                    ->orderByDesc('periode')
                    ->get()
                    ->map(function (DataProfiling $profiling): array {
                        $speedTest = $profiling->speedTest;
                        $isGood = $speedTest?->hasil === 'sesuai';
                        $hasSpeedTest = $speedTest !== null;
                        $activeTickets = $profiling->kendala
                            ->filter(fn ($issue) => $issue->tiket
                                && ! in_array($issue->tiket->status, ['selesai', 'ditolak'], true))
                            ->count();
                        [$year, $month] = array_map(
                            'intval',
                            explode('-', $profiling->periode)
                        );

                        return [
                            'id' => $profiling->id,
                            'opd' => $profiling->opd->nama_opd,
                            'bandwidth' => ($profiling->opd->koneksiInternet
                                ->firstWhere('status', 'aktif')?->bandwidth_mbps ?? 0).' Mbps',
                            'kondisi' => ! $hasSpeedTest
                                ? 'Belum Ada Data'
                                : ($isGood ? 'Baik' : 'Buruk'),
                            'dl' => $speedTest?->kecepatan_unduh === null
                                ? null
                                : (float) $speedTest->kecepatan_unduh,
                            'ul' => $speedTest?->kecepatan_unggah === null
                                ? null
                                : (float) $speedTest->kecepatan_unggah,
                            'tiket' => $activeTickets,
                            'profiling' => match ($profiling->status_verifikasi) {
                                'diajukan' => 'Diajukan',
                                'diverifikasi' => 'Diverifikasi',
                                'dikembalikan' => 'Dikembalikan',
                                default => 'Draft',
                            },
                            'year' => $year,
                            'month' => $month,
                            'baik' => $isGood ? 100 : 0,
                            'sedang' => 0,
                            'buruk' => $hasSpeedTest && ! $isGood ? 100 : 0,
                        ];
                    })
                    ->values())
                : [],
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
