<?php

namespace App\Http\Controllers;

use App\Models\DataProfiling;
use App\Models\Opd;
use App\Models\Tiket;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Laporan/Index', ['summary' => ['total_opd' => Opd::count(), 'profiling' => DataProfiling::selectRaw('status_verifikasi, count(*) total')->groupBy('status_verifikasi')->pluck('total', 'status_verifikasi'), 'tiket' => Tiket::selectRaw('status, count(*) total')->groupBy('status')->pluck('total', 'status')]]);
    }
}
