<?php

namespace Tests\Feature;

use App\Models\Opd;
use App\Models\DataProfiling;
use App\Models\Kendala;
use App\Models\PihakKetiga;
use App\Models\RiwayatTiket;
use App\Models\Tiket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class Phase4AccessAndValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_each_role_can_authenticate(): void
    {
        foreach (['admin', 'opd', 'pihak_ketiga'] as $role) {
            /** @var User $user */
            $user = User::factory()->create([
                'email' => $role . '@example.test',
                'role' => $role,
            ]);

            $response = $this->post('/login', [
                'email' => $user->email,
                'password' => 'password',
            ]);

            $response->assertRedirect();
            $this->assertAuthenticatedAs($user);
            $this->post('/logout');
        }
    }

    public function test_roles_cannot_open_another_roles_dashboard(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['role' => 'admin']);
        /** @var User $opd */
        $opd = User::factory()->create(['role' => 'opd']);
        /** @var User $vendor */
        $vendor = User::factory()->create(['role' => 'pihak_ketiga']);

        $this->actingAs($opd)->get('/admin/laporan')->assertForbidden();
        $this->actingAs($vendor)->get('/admin/laporan')->assertForbidden();
        $this->actingAs($admin)->get('/opd/dashboard')->assertForbidden();
        $this->actingAs($vendor)->get('/opd/dashboard')->assertForbidden();
        $this->actingAs($admin)->get('/vendor/dashboard')->assertForbidden();
        $this->actingAs($opd)->get('/vendor/dashboard')->assertForbidden();
    }

    public function test_admin_can_create_opd_and_empty_payload_is_rejected(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->post('/admin/opd', [])
            ->assertSessionHasErrors(['nama_opd', 'jumlah_pegawai']);

        $this->actingAs($admin)
            ->post('/admin/opd', [
                'nama_opd' => 'Dinas Kesehatan',
                'alamat' => 'Jl. Merdeka No. 1',
                'kecamatan' => 'Klojen',
                'jumlah_pegawai' => 120,
            ])
            ->assertRedirect('/admin/opd');

        $this->assertDatabaseHas('opd', ['nama_opd' => 'Dinas Kesehatan']);
    }

    public function test_opd_profiling_requires_required_fields(): void
    {
        $opd = Opd::create([
            'nama_opd' => 'Dinas Pendidikan',
            'alamat' => 'Jl. Pendidikan',
            'jumlah_pegawai' => 50,
        ]);
        /** @var User $user */
        $user = User::factory()->create(['role' => 'opd', 'opd_id' => $opd->id]);

        $this->actingAs($user)
            ->post('/opd/profiling', [])
            ->assertSessionHasErrors(['periode', 'jumlah_device']);
    }

    public function test_vendor_can_accept_ticket_and_upload_private_evidence(): void
    {
        Storage::fake('local');

        $opd = Opd::create([
            'nama_opd' => 'Dinas Pendidikan',
            'alamat' => 'Jl. Pendidikan',
            'jumlah_pegawai' => 50,
        ]);
        $vendorRecord = PihakKetiga::create([
            'nama_vendor' => 'Vendor Test',
            'jenis_layanan' => 'isp',
        ]);
        /** @var User $opdUser */
        $opdUser = User::factory()->create(['role' => 'opd', 'opd_id' => $opd->id]);
        /** @var User $vendorUser */
        $vendorUser = User::factory()->create([
            'role' => 'pihak_ketiga',
            'pihak_ketiga_id' => $vendorRecord->id,
        ]);
        $profiling = DataProfiling::create([
            'opd_id' => $opd->id,
            'periode' => '2026-09',
            'jumlah_device' => 10,
            'status_verifikasi' => 'diverifikasi',
        ]);
        $kendala = Kendala::create([
            'data_profiling_id' => $profiling->id,
            'jenis_kendala' => 'device',
            'deskripsi' => 'Switch rusak',
        ]);
        $ticket = Tiket::create([
            'nomor_tiket' => 'TKT-UPLOAD-01',
            'kendala_id' => $kendala->id,
            'pihak_ketiga_id' => $vendorRecord->id,
            'dibuat_oleh' => $opdUser->id,
            'urgensi' => 'sedang',
            'status' => 'diteruskan',
        ]);

        $this->actingAs($vendorUser)
            ->from('/tiket/' . $ticket->id)
            ->post('/vendor/tiket/' . $ticket->id . '/status', [
                'status' => 'proses',
                'catatan' => 'Tiket diterima vendor dan penanganan dimulai.',
            ])
            ->assertRedirect('/tiket/' . $ticket->id);
        $this->assertDatabaseHas('tiket', ['id' => $ticket->id, 'status' => 'proses']);

        $this->actingAs($vendorUser)
            ->from('/tiket/' . $ticket->id)
            ->post('/vendor/tiket/' . $ticket->id . '/status', [
                'status' => 'menunggu_verifikasi',
                'catatan' => 'Perangkat diganti dan pengujian selesai.',
                'bukti_file' => UploadedFile::fake()->createWithContent(
                    'bukti.pdf',
                    "%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF",
                ),
            ])
            ->assertRedirect('/tiket/' . $ticket->id);

        $history = RiwayatTiket::where('tiket_id', $ticket->id)->latest('id')->firstOrFail();
        $this->assertDatabaseHas('tiket', ['id' => $ticket->id, 'status' => 'menunggu_verifikasi']);
        $this->assertNotNull($history->bukti_file);
        $this->assertTrue(Storage::disk('local')->exists($history->bukti_file));
        $this->actingAs($vendorUser)->get('/tiket/bukti/' . $history->id)->assertOk();

        $otherOpd = Opd::create([
            'nama_opd' => 'Dinas Kesehatan',
            'alamat' => 'Jl. Kesehatan',
            'jumlah_pegawai' => 70,
        ]);
        /** @var User $otherOpdUser */
        $otherOpdUser = User::factory()->create(['role' => 'opd', 'opd_id' => $otherOpd->id]);
        $this->actingAs($otherOpdUser)->get('/tiket/bukti/' . $history->id)->assertForbidden();

        $this->actingAs($vendorUser)
            ->from('/tiket/' . $ticket->id)
            ->post('/vendor/tiket/' . $ticket->id . '/status', [
                'status' => 'menunggu_verifikasi',
                'catatan' => 'Format bukti tidak didukung.',
                'bukti_file' => UploadedFile::fake()->create('bukti.txt', 10, 'text/plain'),
            ])
            ->assertSessionHasErrors('bukti_file');
    }
}
