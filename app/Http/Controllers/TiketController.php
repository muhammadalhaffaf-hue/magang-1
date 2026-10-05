<?php

namespace App\Http\Controllers;

use App\Models\DataProfiling;
use App\Models\Kendala;
use App\Models\PihakKetiga;
use App\Models\RiwayatTiket;
use App\Models\Tiket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TiketController extends Controller
{
    public function index(): Response
    {
        $query = Tiket::with(['kendala.profiling.opd', 'pihakKetiga'])->latest();
        if (Auth::user()->role === 'opd') $query->whereHas('kendala.profiling', fn($q) => $q->where('opd_id', Auth::user()->opd_id));
        if (Auth::user()->role === 'pihak_ketiga') $query->where('pihak_ketiga_id', Auth::user()->pihak_ketiga_id);
        return Inertia::render('Tiket/Index', ['tickets' => $query->paginate(10), 'vendors' => Auth::user()->role === 'admin' ? PihakKetiga::orderBy('nama_vendor')->get(['id', 'nama_vendor']) : []]);
    }

    public function create(): Response
    {
        $profiling = DataProfiling::query()
            ->where('opd_id', Auth::user()->opd_id)
            ->where('status_verifikasi', 'diverifikasi')
            ->latest()
            ->first();
        $kendala = $profiling
            ? $profiling->kendala()->with('profiling.opd')->whereDoesntHave('tiket')->get()
            : collect();
        return Inertia::render('Tiket/Form', ['kendala' => $kendala]);
    }

    public function store(Request $request): RedirectResponse|JsonResponse
    {
        abort_unless(Auth::user()->role === 'opd' && Auth::user()->opd_id, 403);
        $profiling = DataProfiling::query()
            ->where('opd_id', Auth::user()->opd_id)
            ->where('status_verifikasi', 'diverifikasi')
            ->latest()
            ->first();
        abort_if(
            ! $profiling,
            422,
            'Tiket belum dapat diajukan karena belum ada profiling terverifikasi. Ajukan profiling terlebih dahulu dan tunggu verifikasi Admin.',
        );

        $data = $request->validate([
            'kendala_id' => ['required', 'integer', 'exists:kendala,id'],
            'urgensi' => ['required', 'in:rendah,sedang,tinggi'],
        ]);

        $ticket = DB::transaction(function () use ($data, $profiling) {
            $kendala = Kendala::with('profiling')
                ->lockForUpdate()
                ->findOrFail($data['kendala_id']);
            abort_unless($kendala->profiling->opd_id === Auth::user()->opd_id, 403);
            abort_unless(
                $kendala->profiling->status_verifikasi === 'diverifikasi',
                422,
                'Tiket hanya dapat diajukan untuk kendala dari profiling yang sudah diverifikasi.',
            );
            abort_unless(
                $kendala->data_profiling_id === $profiling->id,
                422,
                'Pilih kendala dari profiling terverifikasi terbaru.',
            );
            abort_if(
                $kendala->tiket()->exists(),
                422,
                'Kendala ini sudah memiliki tiket. Pantau tiket yang sudah diajukan.',
            );

            $ticket = Tiket::create([
                'kendala_id' => $kendala->id,
                'urgensi' => $data['urgensi'],
                'nomor_tiket' => 'TKT-'.now()->format('ymd').'-'.Str::upper(Str::random(5)),
                'dibuat_oleh' => Auth::id(),
                'status' => 'baru',
            ]);
            $this->history($ticket, 'Tiket dibuat oleh OPD', 'baru');

            return $ticket;
        });

        if ($request->expectsJson()) {
            return response()->json([
                'ticket' => $ticket->load(['kendala.profiling.opd', 'pihakKetiga', 'riwayat.user']),
            ], 201);
        }

        return redirect()->route('tiket.index')->with('success', 'Tiket berhasil diajukan.');
    }

    public function show(Tiket $tiket): Response
    {
        $this->authorizeTicket($tiket);
        return Inertia::render('Tiket/Show', ['ticket' => $tiket->load(['kendala.profiling.opd', 'pihakKetiga', 'riwayat.user']), 'role' => Auth::user()->role]);
    }

    public function downloadEvidence(RiwayatTiket $riwayat)
    {
        abort_unless(filled($riwayat->bukti_file), 404);
        $this->authorizeTicket($riwayat->tiket);

        $disk = Storage::disk('local');
        $privateRoot = realpath($disk->path(''));
        $filePath = $privateRoot ? realpath($disk->path($riwayat->bukti_file)) : false;
        abort_unless(
            $privateRoot && $filePath && str_starts_with($filePath, $privateRoot . DIRECTORY_SEPARATOR) && is_file($filePath),
            404,
        );

        return response()->download($filePath, basename($filePath));
    }

    public function forward(Request $request, Tiket $tiket): RedirectResponse|JsonResponse
    {
        abort_unless(Auth::user()->role === 'admin' && $tiket->status === 'baru', 403);
        $data = $request->validate([
            'pihak_ketiga_id' => ['nullable', 'required_unless:ditangani_internal,true', 'exists:pihak_ketiga,id'],
            'ditangani_internal' => ['required', 'boolean'],
            'catatan_admin' => ['nullable', 'string'],
        ]);
        $internal = (bool) ($data['ditangani_internal'] ?? false);
        $tiket->update(['pihak_ketiga_id' => $internal ? null : ($data['pihak_ketiga_id'] ?? null), 'ditangani_internal' => $internal, 'catatan_admin' => $data['catatan_admin'] ?? null, 'status' => $internal ? 'proses' : 'diteruskan']);
        $this->history($tiket, $internal ? 'Tiket ditangani internal' : 'Tiket diteruskan ke pihak ketiga', $tiket->status);
        if ($request->expectsJson()) {
            return response()->json([
                'ticket' => $tiket->load(['kendala.profiling.opd', 'pihakKetiga', 'riwayat.user']),
            ]);
        }
        return back()->with('success', 'Tiket berhasil diproses.');
    }

    public function updateStatus(Request $request, Tiket $tiket): RedirectResponse|JsonResponse
    {
        $user = Auth::user();
        abort_unless(in_array($user->role, ['admin', 'pihak_ketiga'], true), 403);

        if ($user->role === 'pihak_ketiga') {
            abort_unless(
                $user->pihak_ketiga_id !== null &&
                    $tiket->pihak_ketiga_id === $user->pihak_ketiga_id,
                403,
            );
            abort_unless(in_array($tiket->status, ['diteruskan', 'proses'], true), 422);
        }

        $allowedStatuses = $user->role === 'pihak_ketiga'
            ? ($tiket->status === 'diteruskan' ? 'proses,ditolak' : 'proses,menunggu_verifikasi')
            : 'proses,selesai,ditolak';
        $data = $request->validate([
            'status' => ['required', 'in:'.$allowedStatuses],
            'catatan' => ['required', 'string', 'max:10000'],
            'bukti_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        if ($data['status'] === 'menunggu_verifikasi') {
            $request->validate([
                'bukti_file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            ]);
        }

        if ($data['status'] === 'selesai') {
            abort_unless(
                $tiket->status === 'menunggu_verifikasi' &&
                    $tiket->riwayat()->whereNotNull('bukti_file')->exists(),
                422,
                'Bukti penanganan vendor wajib diverifikasi sebelum tiket diselesaikan.',
            );
        }

        $path = $request->hasFile('bukti_file')
            ? $request->file('bukti_file')->store('bukti-tiket', 'local')
            : null;
        DB::transaction(function () use ($tiket, $data, $path) {
            $tiket->update(['status' => $data['status']]);
            $this->history($tiket, $data['catatan'], $data['status'], $path);
        });

        if ($request->expectsJson()) {
            return response()->json([
                'ticket' => $tiket->fresh()->load([
                    'kendala.profiling.opd',
                    'pihakKetiga',
                    'riwayat.user',
                ]),
            ]);
        }

        return back()->with('success', 'Status tiket berhasil diperbarui.');
    }

    private function history(Tiket $tiket, string $catatan, string $status, ?string $path = null): void
    {
        RiwayatTiket::create(['tiket_id' => $tiket->id, 'user_id' => Auth::id(), 'catatan' => $catatan, 'status_baru' => $status, 'bukti_file' => $path, 'tanggal' => now()]);
    }
    private function authorizeTicket(Tiket $tiket): void
    {
        $user = Auth::user();
        if ($user->role === 'admin') return;
        if ($user->role === 'pihak_ketiga' && $tiket->pihak_ketiga_id === $user->pihak_ketiga_id) return;
        if ($user->role === 'opd' && $tiket->kendala()->whereHas('profiling', fn($q) => $q->where('opd_id', $user->opd_id))->exists()) return;
        abort(403);
    }
}
