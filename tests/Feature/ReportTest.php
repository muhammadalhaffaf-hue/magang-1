<?php

namespace Tests\Feature;

use App\Models\DataProfiling;
use App\Models\Kendala;
use App\Models\KoneksiInternet;
use App\Models\Opd;
use App\Models\SpeedTest;
use App\Models\Tiket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dashboard_report_rows_are_built_from_database_records(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $opd = Opd::query()->create(['nama_opd' => 'Dinas Uji']);
        KoneksiInternet::query()->create([
            'opd_id' => $opd->id,
            'nama_isp' => 'ISP Uji',
            'bandwidth_mbps' => 100,
            'status' => 'aktif',
        ]);
        $profiling = DataProfiling::query()->create([
            'opd_id' => $opd->id,
            'periode' => '2026-09',
            'status_verifikasi' => 'diverifikasi',
        ]);
        SpeedTest::query()->create([
            'data_profiling_id' => $profiling->id,
            'kecepatan_unduh' => 87.5,
            'kecepatan_unggah' => 34.25,
            'hasil' => 'sesuai',
            'tanggal_test' => '2026-09-20',
        ]);

        foreach (['proses', 'selesai'] as $index => $status) {
            $issue = Kendala::query()->create([
                'data_profiling_id' => $profiling->id,
                'jenis_kendala' => 'device',
            ]);
            Tiket::query()->create([
                'nomor_tiket' => 'TKT-REPORT-'.$index,
                'kendala_id' => $issue->id,
                'dibuat_oleh' => $admin->id,
                'status' => $status,
            ]);
        }

        $this->actingAs($admin)
            ->get('/admin/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Opd/Index')
                ->has('reportRows', 1)
                ->where('reportRows.0.opd', 'Dinas Uji')
                ->where('reportRows.0.kondisi', 'Baik')
                ->where('reportRows.0.dl', 87.5)
                ->where('reportRows.0.ul', 34.25)
                ->where('reportRows.0.tiket', 1)
                ->where('reportRows.0.profiling', 'Diverifikasi')
                ->where('reportRows.0.year', 2026)
                ->where('reportRows.0.month', 9)
                ->where('reportRows.0.baik', 100)
                ->where('reportRows.0.sedang', 0)
                ->where('reportRows.0.buruk', 0));
    }
}
