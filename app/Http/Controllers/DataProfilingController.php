<?php

namespace App\Http\Controllers;

use App\Models\AplikasiDigunakan;
use App\Models\DataProfiling;
use App\Models\Kendala;
use App\Models\Opd;
use App\Models\SpeedTest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DataProfilingController extends Controller
{
    public function index(): Response
    {
        $query = DataProfiling::with('opd')->latest();
        if (Auth::user()->role === 'opd') $query->where('opd_id', Auth::user()->opd_id);
        return Inertia::render('Profiling/Index', ['profilings' => $query->paginate(10), 'role' => Auth::user()->role]);
    }

    public function create(): Response
    {
        return Inertia::render('Profiling/Form', ['profiling' => null, 'opds' => Auth::user()->role === 'admin' ? Opd::orderBy('nama_opd')->get(['id', 'nama_opd']) : []]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $data['opd_id'] = Auth::user()->role === 'opd' ? Auth::user()->opd_id : $data['opd_id'];
        $profiling = DB::transaction(function () use ($data, $request) {
            $profiling = DataProfiling::create($data + ['status_verifikasi' => 'draft']);
            $this->saveChildren($profiling, $request);
            return $profiling;
        });
        if ($request->boolean('ajukan')) $this->submitProfiling($profiling);
        return redirect()->route('profiling.index')->with('success', 'Data profiling berhasil disimpan.');
    }

    public function edit(DataProfiling $profiling): Response
    {
        $this->authorizeOwner($profiling);
        return Inertia::render('Profiling/Form', ['profiling' => $profiling->load(['aplikasi', 'speedTest', 'kendala']), 'opds' => []]);
    }

    public function update(Request $request, DataProfiling $profiling): RedirectResponse
    {
        $this->authorizeOwner($profiling);
        abort_if($profiling->status_verifikasi === 'diverifikasi', 422, 'Profiling yang sudah diverifikasi tidak dapat diubah.');
        $data = $this->validated($request);
        unset($data['opd_id']);
        DB::transaction(function () use ($profiling, $data, $request) {
            $profiling->update($data + ['status_verifikasi' => 'draft']);
            $profiling->aplikasi()->delete();
            $profiling->kendala()->delete();
            $profiling->speedTest()->delete();
            $this->saveChildren($profiling, $request);
        });
        if ($request->boolean('ajukan')) $this->submitProfiling($profiling);
        return redirect()->route('profiling.index')->with('success', 'Data profiling berhasil diperbarui.');
    }

    public function submit(DataProfiling $profiling): RedirectResponse
    {
        $this->authorizeOwner($profiling);
        $this->submitProfiling($profiling);
        return back()->with('success', 'Profiling diajukan untuk verifikasi admin.');
    }

    public function verify(DataProfiling $profiling): RedirectResponse
    {
        abort_unless(Auth::user()->role === 'admin', 403);
        abort_unless($profiling->status_verifikasi === 'diajukan', 422, 'Hanya profiling berstatus diajukan yang dapat diverifikasi.');
        $profiling->update(['status_verifikasi' => 'diverifikasi', 'diverifikasi_oleh' => Auth::id(), 'tanggal_diverifikasi' => now()]);
        return back()->with('success', 'Profiling berhasil diverifikasi.');
    }

    public function returnForRevision(Request $request, DataProfiling $profiling): RedirectResponse
    {
        abort_unless(Auth::user()->role === 'admin', 403);
        $profiling->update(['status_verifikasi' => 'dikembalikan', 'kesimpulan' => $request->validate(['catatan' => ['required', 'string']])['catatan'], 'diverifikasi_oleh' => Auth::id(), 'tanggal_diverifikasi' => now()]);
        return back()->with('success', 'Profiling dikembalikan untuk diperbaiki.');
    }

    private function validated(Request $request): array
    {
        return $request->validate(['opd_id' => ['nullable', 'exists:opd,id'], 'periode' => ['required', 'string', 'max:50'], 'jumlah_device' => ['required', 'integer', 'min:0'], 'kesimpulan' => ['nullable', 'string']]);
    }
    private function saveChildren(DataProfiling $profiling, Request $request): void
    {
        foreach ($request->input('aplikasi', []) as $nama) if (filled($nama)) AplikasiDigunakan::create(['data_profiling_id' => $profiling->id, 'nama_aplikasi' => $nama]);
        if ($request->filled('kecepatan_unduh')) SpeedTest::create(['data_profiling_id' => $profiling->id, 'kecepatan_unduh' => $request->input('kecepatan_unduh'), 'kecepatan_unggah' => $request->input('kecepatan_unggah'), 'hasil' => $request->input('hasil', 'sesuai'), 'tanggal_test' => $request->input('tanggal_test', now()->toDateString())]);
        foreach ($request->input('kendala', []) as $item) if (filled($item['jenis_kendala'] ?? null)) Kendala::create(['data_profiling_id' => $profiling->id, 'jenis_kendala' => $item['jenis_kendala'], 'deskripsi' => $item['deskripsi'] ?? null]);
    }
    private function submitProfiling(DataProfiling $profiling): void
    {
        $profiling->update(['status_verifikasi' => 'diajukan', 'tanggal_diajukan' => now()]);
    }
    private function authorizeOwner(DataProfiling $profiling): void
    {
        abort_unless(Auth::user()->role === 'admin' || Auth::user()->opd_id === $profiling->opd_id, 403);
    }
}
