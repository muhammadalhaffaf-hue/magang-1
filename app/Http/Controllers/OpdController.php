<?php

namespace App\Http\Controllers;

use App\Models\Opd;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OpdController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Opd/Index', [
            'opds' => Opd::query()->latest()->paginate(10)->withQueryString(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Opd/Form', ['opd' => null]);
    }

    public function store(Request $request): RedirectResponse
    {
        Opd::create($this->validated($request));

        return redirect()->route('opd.index')->with('success', 'Data OPD berhasil ditambahkan.');
    }

    public function show(Opd $opd): Response
    {
        return Inertia::render('Admin/Opd/Show', [
            'opd' => $opd->loadCount(['users', 'dataProfiling', 'tiket']),
        ]);
    }

    public function edit(Opd $opd): Response
    {
        return Inertia::render('Admin/Opd/Form', ['opd' => $opd]);
    }

    public function update(Request $request, Opd $opd): RedirectResponse
    {
        $opd->update($this->validated($request));

        return redirect()->route('opd.index')->with('success', 'Data OPD berhasil diperbarui.');
    }

    public function destroy(Opd $opd): RedirectResponse
    {
        $opd->delete();

        return redirect()->route('opd.index')->with('success', 'Data OPD berhasil dihapus.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'nama_opd' => ['required', 'string', 'max:150'],
            'alamat' => ['nullable', 'string'],
            'kecamatan' => ['nullable', 'string', 'max:100'],
            'jumlah_pegawai' => ['required', 'integer', 'min:0'],
            'penanggung_jawab' => ['nullable', 'string', 'max:150'],
            'kontak' => ['nullable', 'string', 'max:50'],
        ]);
    }
}
