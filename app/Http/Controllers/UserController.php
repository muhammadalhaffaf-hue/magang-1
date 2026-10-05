<?php

namespace App\Http\Controllers;

use App\Models\Opd;
use App\Models\PihakKetiga;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/User/Index', ['users' => User::with(['opd', 'pihakKetiga'])->latest()->paginate(10)]);
    }
    public function create(): Response
    {
        return Inertia::render('Admin/User/Form', ['user' => null, 'opds' => Opd::orderBy('nama_opd')->get(['id', 'nama_opd']), 'vendors' => PihakKetiga::orderBy('nama_vendor')->get(['id', 'nama_vendor'])]);
    }
    public function store(Request $request): RedirectResponse
    {
        User::create($this->validated($request));
        return redirect()->route('users.index')->with('success', 'Pengguna berhasil ditambahkan.');
    }
    public function edit(User $user): Response
    {
        return Inertia::render('Admin/User/Form', ['user' => $user, 'opds' => Opd::orderBy('nama_opd')->get(['id', 'nama_opd']), 'vendors' => PihakKetiga::orderBy('nama_vendor')->get(['id', 'nama_vendor'])]);
    }
    public function update(Request $request, User $user): RedirectResponse
    {
        $user->update($this->validated($request, $user));
        return redirect()->route('users.index')->with('success', 'Pengguna berhasil diperbarui.');
    }
    public function destroy(User $user): RedirectResponse
    {
        abort_if(Auth::id() === $user->id, 422, 'Akun yang sedang digunakan tidak dapat dihapus.');
        $user->delete();
        return redirect()->route('users.index')->with('success', 'Pengguna berhasil dihapus.');
    }
    private function validated(Request $request, ?User $user = null): array
    {
        $data = $request->validate(['nama' => ['required', 'string', 'max:150'], 'email' => ['required', 'email', 'max:150', 'unique:users,email,' . ($user?->id ?? 'NULL')], 'role' => ['required', 'in:admin,opd,pihak_ketiga'], 'opd_id' => ['nullable', 'required_if:role,opd', 'exists:opd,id'], 'pihak_ketiga_id' => ['nullable', 'required_if:role,pihak_ketiga', 'exists:pihak_ketiga,id'], 'status' => ['required', 'in:aktif,nonaktif'], 'password' => [$user ? 'nullable' : 'required', 'string', 'min:8']]);
        if ($data['role'] === 'opd') {
            $data['pihak_ketiga_id'] = null;
        } elseif ($data['role'] === 'pihak_ketiga') {
            $data['opd_id'] = null;
        } else {
            $data['opd_id'] = null;
            $data['pihak_ketiga_id'] = null;
        }
        if (blank($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }
        return $data;
    }
}
