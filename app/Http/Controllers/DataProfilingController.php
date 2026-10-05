<?php

namespace App\Http\Controllers;

use App\Models\AplikasiDigunakan;
use App\Models\DataProfiling;
use App\Models\Kendala;
use App\Models\KoneksiInternet;
use App\Models\Opd;
use App\Models\SpeedTest;
use Illuminate\Http\JsonResponse;
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

    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $data = $this->validated($request);
        abort_if(
            Auth::user()->role === 'opd' && ! Auth::user()->opd_id,
            403,
            'Akun OPD ini belum terhubung dengan data OPD.',
        );
        if (Auth::user()->role === 'opd') {
            $data['opd_id'] = Auth::user()->opd_id;
        }

        $existing = DataProfiling::where('opd_id', $data['opd_id'])
            ->where('periode', $data['periode'])
            ->first();
        if ($existing && ! in_array($existing->status_verifikasi, ['draft', 'dikembalikan'], true)) {
            abort(422, 'Profiling periode ini sudah diajukan atau diverifikasi dan tidak dapat ditimpa.');
        }

        $profiling = DB::transaction(function () use ($data, $request, $existing) {
            if ($existing) {
                $profiling = $existing;
                $profiling->update($data + ['status_verifikasi' => 'draft']);
                $profiling->aplikasi()->delete();
                $profiling->kendala()->delete();
                $profiling->speedTest()->delete();
            } else {
                $profiling = DataProfiling::create($data + ['status_verifikasi' => 'draft']);
            }

            $this->saveChildren($profiling, $request);
            $this->saveConnection($profiling, $request);
            return $profiling;
        });
        if ($request->boolean('ajukan')) $this->submitProfiling($profiling);
        if ($request->expectsJson()) {
            return response()->json([
                'profiling' => $profiling->load(['opd.koneksiInternet', 'aplikasi', 'speedTest', 'kendala']),
            ], $existing ? 200 : 201);
        }

        return redirect()->route('profiling.index')->with('success', 'Data profiling berhasil disimpan.');
    }

    public function edit(DataProfiling $profiling): Response
    {
        $this->authorizeOwner($profiling);
        return Inertia::render('Profiling/Form', ['profiling' => $profiling->load(['aplikasi', 'speedTest', 'kendala']), 'opds' => []]);
    }

    public function update(Request $request, DataProfiling $profiling): RedirectResponse|JsonResponse
    {
        $this->authorizeOwner($profiling);
        abort_unless(
            in_array($profiling->status_verifikasi, ['draft', 'dikembalikan'], true),
            422,
            'Profiling yang sudah diajukan tidak dapat diubah kecuali dikembalikan oleh Admin.',
        );
        $data = $this->validated($request);
        unset($data['opd_id']);
        DB::transaction(function () use ($profiling, $data, $request) {
            $profiling->update($data + ['status_verifikasi' => 'draft']);
            $profiling->aplikasi()->delete();
            $profiling->kendala()->delete();
            $profiling->speedTest()->delete();
            $this->saveChildren($profiling, $request);
            $this->saveConnection($profiling, $request);
        });
        if ($request->boolean('ajukan')) $this->submitProfiling($profiling);
        if ($request->expectsJson()) {
            return response()->json([
                'profiling' => $profiling->load(['opd.koneksiInternet', 'aplikasi', 'speedTest', 'kendala']),
            ]);
        }

        return redirect()->route('profiling.index')->with('success', 'Data profiling berhasil diperbarui.');
    }

    public function submit(DataProfiling $profiling): RedirectResponse
    {
        $this->authorizeOwner($profiling);
        $this->submitProfiling($profiling);
        return back()->with('success', 'Profiling diajukan untuk verifikasi admin.');
    }

    public function verify(Request $request, DataProfiling $profiling): RedirectResponse|JsonResponse
    {
        abort_unless(Auth::user()->role === 'admin', 403);
        abort_unless($profiling->status_verifikasi === 'diajukan', 422, 'Hanya profiling berstatus diajukan yang dapat diverifikasi.');
        $data = $request->validate(['kesimpulan' => ['nullable', 'string']]);
        $profiling->update($data + ['status_verifikasi' => 'diverifikasi', 'diverifikasi_oleh' => Auth::id(), 'tanggal_diverifikasi' => now()]);
        if ($request->expectsJson()) {
            return response()->json(['profiling' => $profiling->fresh()]);
        }

        return back()->with('success', 'Profiling berhasil diverifikasi.');
    }

    public function returnForRevision(Request $request, DataProfiling $profiling): RedirectResponse|JsonResponse
    {
        abort_unless(Auth::user()->role === 'admin', 403);
        $profiling->update(['status_verifikasi' => 'dikembalikan', 'kesimpulan' => $request->validate(['catatan' => ['required', 'string']])['catatan'], 'diverifikasi_oleh' => Auth::id(), 'tanggal_diverifikasi' => now()]);
        if ($request->expectsJson()) {
            return response()->json(['profiling' => $profiling->fresh()]);
        }

        return back()->with('success', 'Profiling dikembalikan untuk diperbaiki.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'opd_id' => ['nullable', 'exists:opd,id'],
            'periode' => ['required', 'string', 'max:50'],
            'jumlah_device' => ['required', 'integer', 'min:0'],
            'kesimpulan' => ['nullable', 'string'],
            'nama_isp' => ['nullable', 'string', 'max:100'],
            'bandwidth_mbps' => ['nullable', 'numeric', 'min:0'],
            'ping_ms' => ['nullable', 'numeric', 'min:0'],
            'kendala' => ['sometimes', 'array'],
            'kendala.*.jenis_kendala' => ['required', 'in:bandwidth_kurang,device,topologi,sosialisasi,lainnya'],
            'kendala.*.nama_kendala' => ['required_if:kendala.*.jenis_kendala,lainnya', 'nullable', 'string', 'max:150'],
            'kendala.*.deskripsi' => ['nullable', 'string', 'max:10000'],
        ]);
    }
    private function saveChildren(DataProfiling $profiling, Request $request): void
    {
        foreach ($request->input('aplikasi', []) as $nama) if (filled($nama)) AplikasiDigunakan::create(['data_profiling_id' => $profiling->id, 'nama_aplikasi' => $nama]);
        if ($request->filled('kecepatan_unduh')) SpeedTest::create([
            'data_profiling_id' => $profiling->id,
            'kecepatan_unduh' => $request->input('kecepatan_unduh'),
            'kecepatan_unggah' => $request->input('kecepatan_unggah'),
            'ping_ms' => $request->input('ping_ms'),
            'hasil' => $request->input('hasil', 'sesuai'),
            'tanggal_test' => $request->input('tanggal_test', now()->toDateString()),
        ]);
        foreach ($request->input('kendala', []) as $item) {
            if (! filled($item['jenis_kendala'] ?? null)) continue;

            Kendala::create([
                'data_profiling_id' => $profiling->id,
                'jenis_kendala' => $item['jenis_kendala'] === 'lainnya'
                    ? 'sosialisasi'
                    : $item['jenis_kendala'],
                'nama_kendala' => $item['jenis_kendala'] === 'lainnya'
                    ? trim($item['nama_kendala'])
                    : null,
                'deskripsi' => $item['deskripsi'] ?? null,
            ]);
        }
    }
    private function saveConnection(DataProfiling $profiling, Request $request): void
    {
        if (!$request->filled('nama_isp') || !$request->filled('bandwidth_mbps')) return;

        $connection = KoneksiInternet::where('opd_id', $profiling->opd_id)
            ->where('status', 'aktif')
            ->latest()
            ->first();
        $data = [
            'nama_isp' => $request->input('nama_isp'),
            'bandwidth_mbps' => $request->input('bandwidth_mbps'),
        ];

        if ($connection) {
            $connection->update($data);
            return;
        }

        KoneksiInternet::create($data + [
            'opd_id' => $profiling->opd_id,
            'status' => 'aktif',
        ]);
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
