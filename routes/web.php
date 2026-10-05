<?php

use App\Http\Controllers\OpdController;
use App\Http\Controllers\KoneksiInternetController;
use App\Http\Controllers\DataProfilingController;
use App\Http\Controllers\TiketController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\PihakKetigaController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Halaman Utama
Route::get('/', function () {
    return view('welcome');
});

// Fallback Dashboard Bawaan (Opsional)
Route::get('/dashboard', function () {
    return app(DashboardController::class)->__invoke(request());
})->middleware('auth')->name('dashboard');

// Route yang Membutuhkan Login (Auth)
Route::middleware('auth')->group(function () {

    // 1. ROUTE KHUSUS ADMIN
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', function () {
            return app(DashboardController::class)->__invoke(request());
        })->name('admin.dashboard');
        Route::get('/laporan', [ReportController::class, 'index'])->name('admin.laporan');

        // CRUD OPD ditaruh di sini agar hanya Admin yang bisa mengelola OPD
        Route::resource('opd', OpdController::class);
        Route::resource('users', UserController::class)->except(['show']);
        Route::resource('pihak-ketiga', PihakKetigaController::class);
        Route::resource('koneksi-internet', KoneksiInternetController::class);
        Route::post('profiling/{profiling}/verify', [DataProfilingController::class, 'verify'])->name('profiling.verify');
        Route::post('profiling/{profiling}/return', [DataProfilingController::class, 'returnForRevision'])->name('profiling.return');
        Route::get('profiling', [DataProfilingController::class, 'index'])->name('admin.profiling.index');
        Route::post('tiket/{tiket}/forward', [TiketController::class, 'forward'])->name('tiket.forward');
        Route::post('tiket/{tiket}/status', [TiketController::class, 'updateStatus'])->name('tiket.status');
    });

    // 2. ROUTE KHUSUS OPD
    Route::middleware('role:opd')->prefix('opd')->group(function () {
        Route::get('/dashboard', function () {
            return app(DashboardController::class)->__invoke(request());
        })->name('opd.dashboard');
        Route::resource('profiling', DataProfilingController::class)->only(['index', 'create', 'store', 'edit', 'update']);
        Route::post('profiling/{profiling}/submit', [DataProfilingController::class, 'submit'])->name('profiling.submit');
        Route::get('/tiket/create', [TiketController::class, 'create'])->name('tiket.create');
        Route::post('/tiket', [TiketController::class, 'store'])->name('tiket.store');
    });

    // 3. ROUTE KHUSUS PIHAK KETIGA / VENDOR
    Route::middleware('role:pihak_ketiga')->prefix('vendor')->group(function () {
        Route::get('/dashboard', function () {
            return app(DashboardController::class)->__invoke(request());
        })->name('vendor.dashboard');
        Route::post('/tiket/{tiket}/status', [TiketController::class, 'updateStatus'])->name('vendor.tiket.status');
    });

    // Route bawaan Breeze untuk Profile (Bisa diakses semua role yang login)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/tiket', [TiketController::class, 'index'])->name('tiket.index');
    Route::get('/tiket/{tiket}', [TiketController::class, 'show'])->name('tiket.show');
    Route::get('/tiket/bukti/{riwayat}', [TiketController::class, 'downloadEvidence'])->name('tiket.evidence');
});

require __DIR__ . '/auth.php';
