<?php

namespace App\Http\Controllers;

use App\Models\PihakKetiga;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PihakKetigaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/PihakKetiga/Index', ['vendors' => PihakKetiga::latest()->paginate(10)]);
    }
    public function create(): Response
    {
        return Inertia::render('Admin/PihakKetiga/Form', ['vendor' => null]);
    }
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $vendor = PihakKetiga::create($this->validated($request));
        if ($request->expectsJson()) {
            return response()->json(['vendor' => $vendor], 201);
        }

        return redirect()->route('pihak-ketiga.index')->with('success', 'Data pihak ketiga berhasil ditambahkan.');
    }
    public function show(PihakKetiga $pihakKetiga): Response
    {
        return Inertia::render('Admin/PihakKetiga/Show', ['vendor' => $pihakKetiga->loadCount('users')]);
    }
    public function edit(PihakKetiga $pihakKetiga): Response
    {
        return Inertia::render('Admin/PihakKetiga/Form', ['vendor' => $pihakKetiga]);
    }
    public function update(Request $request, PihakKetiga $pihakKetiga): RedirectResponse
    {
        $pihakKetiga->update($this->validated($request));
        return redirect()->route('pihak-ketiga.index')->with('success', 'Data pihak ketiga berhasil diperbarui.');
    }
    public function destroy(PihakKetiga $pihakKetiga): RedirectResponse
    {
        $pihakKetiga->delete();
        return redirect()->route('pihak-ketiga.index')->with('success', 'Data pihak ketiga berhasil dihapus.');
    }
    private function validated(Request $request): array
    {
        return $request->validate(['nama_vendor' => ['required', 'string', 'max:150'], 'jenis_layanan' => ['required', 'in:isp,perangkat,lainnya'], 'kontak_person' => ['nullable', 'string', 'max:150'], 'nomor_kontak' => ['nullable', 'string', 'max:50']]);
    }
}
