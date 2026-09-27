<?php

namespace App\Http\Controllers;

use App\Models\Kendala;
use App\Models\PihakKetiga;
use App\Models\RiwayatTiket;
use App\Models\Tiket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
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
        $kendala = Kendala::with('profiling.opd')->whereDoesntHave('tiket')->whereHas('profiling', fn($q) => $q->where('opd_id', Auth::user()->opd_id)->where('status_verifikasi', 'diverifikasi'))->get();
        return Inertia::render('Tiket/Form', ['kendala' => $kendala]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate(['kendala_id' => ['required', 'exists:kendala,id'], 'urgensi' => ['required', 'in:rendah,sedang,tinggi']]);
        $kendala = Kendala::with('profiling')->findOrFail($data['kendala_id']);
        abort_unless(Auth::user()->role === 'opd' && $kendala->profiling->opd_id === Auth::user()->opd_id, 403);
        $ticket = Tiket::create($data + ['nomor_tiket' => 'TKT-' . now()->format('ymd') . '-' . Str::upper(Str::random(5)), 'dibuat_oleh' => Auth::id(), 'status' => 'baru']);
        $this->history($ticket, 'Tiket dibuat oleh OPD', 'baru');
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

        $configuredRoot = config('filesystems.disks.local.root');
        $privateRoot = is_string($configuredRoot) ? realpath($configuredRoot) : false;
        $filePath = $privateRoot ? realpath($privateRoot . DIRECTORY_SEPARATOR . $riwayat->bukti_file) : false;
        abort_unless(
            $privateRoot && $filePath && str_starts_with($filePath, $privateRoot . DIRECTORY_SEPARATOR) && is_file($filePath),
            404,
        );

        return response()->download($filePath, basename($filePath));
    }

    public function forward(Request $request, Tiket $tiket): RedirectResponse
    {
        abort_unless(Auth::user()->role === 'admin' && $tiket->status === 'baru', 403);
        $data = $request->validate(['pihak_ketiga_id' => ['nullable', 'exists:pihak_ketiga,id'], 'ditangani_internal' => ['nullable', 'boolean'], 'catatan_admin' => ['nullable', 'string']]);
        $internal = (bool) ($data['ditangani_internal'] ?? false);
        $tiket->update(['pihak_ketiga_id' => $internal ? null : ($data['pihak_ketiga_id'] ?? null), 'ditangani_internal' => $internal, 'catatan_admin' => $data['catatan_admin'] ?? null, 'status' => $internal ? 'proses' : 'diteruskan']);
        $this->history($tiket, $internal ? 'Tiket ditangani internal' : 'Tiket diteruskan ke pihak ketiga', $tiket->status);
        return back()->with('success', 'Tiket berhasil diproses.');
    }

    public function updateStatus(Request $request, Tiket $tiket): RedirectResponse
    {
        $data = $request->validate(['status' => ['required', 'in:proses,menunggu_verifikasi,selesai,ditolak'], 'catatan' => ['required', 'string'], 'bukti_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120']]);
        if (Auth::user()->role === 'pihak_ketiga') abort_unless($tiket->pihak_ketiga_id === Auth::user()->pihak_ketiga_id && in_array($data['status'], ['proses', 'menunggu_verifikasi']), 403);
        if (Auth::user()->role === 'admin') abort_unless(in_array($data['status'], ['proses', 'selesai', 'ditolak']), 403);
        abort_unless($tiket->status !== 'selesai', 422);
        if ($data['status'] === 'menunggu_verifikasi') $request->validate(['bukti_file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120']]);
        if ($data['status'] === 'selesai') abort_unless($tiket->riwayat()->whereNotNull('bukti_file')->exists() || $request->hasFile('bukti_file'), 422, 'Bukti penanganan wajib tersedia sebelum tiket diselesaikan.');
        $path = $request->hasFile('bukti_file') ? $request->file('bukti_file')->store('bukti-tiket', 'local') : null;
        $tiket->update(['status' => $data['status']]);
        $this->history($tiket, $data['catatan'], $data['status'], $path);
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
