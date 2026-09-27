<?php

namespace App\Http\Controllers;

use App\Models\KoneksiInternet;
use App\Models\Opd;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KoneksiInternetController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Koneksi/Index', ['connections' => KoneksiInternet::with('opd')->latest()->paginate(10)]);
    }
    public function create(): Response
    {
        return Inertia::render('Admin/Koneksi/Form', ['connection' => null, 'opds' => Opd::orderBy('nama_opd')->get(['id', 'nama_opd'])]);
    }
    public function store(Request $request): RedirectResponse
    {
        KoneksiInternet::create($this->validated($request));
        return redirect()->route('koneksi-internet.index')->with('success', 'Koneksi internet berhasil ditambahkan.');
    }
    public function show(KoneksiInternet $koneksiInternet): Response
    {
        return Inertia::render('Admin/Koneksi/Show', ['connection' => $koneksiInternet->load('opd')]);
    }
    public function edit(KoneksiInternet $koneksiInternet): Response
    {
        return Inertia::render('Admin/Koneksi/Form', ['connection' => $koneksiInternet, 'opds' => Opd::orderBy('nama_opd')->get(['id', 'nama_opd'])]);
    }
    public function update(Request $request, KoneksiInternet $koneksiInternet): RedirectResponse
    {
        $koneksiInternet->update($this->validated($request));
        return redirect()->route('koneksi-internet.index')->with('success', 'Koneksi internet berhasil diperbarui.');
    }
    public function destroy(KoneksiInternet $koneksiInternet): RedirectResponse
    {
        $koneksiInternet->delete();
        return redirect()->route('koneksi-internet.index')->with('success', 'Koneksi internet berhasil dihapus.');
    }
    private function validated(Request $request): array
    {
        return $request->validate(['opd_id' => ['required', 'exists:opd,id'], 'nama_isp' => ['required', 'string', 'max:100'], 'bandwidth_mbps' => ['required', 'numeric', 'min:0'], 'tanggal_aktif' => ['nullable', 'date'], 'status' => ['required', 'in:aktif,bermasalah,tidak_aktif']]);
    }
}
