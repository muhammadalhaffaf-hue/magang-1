<?php

namespace Tests\Feature;

use App\Models\DataProfiling;
use App\Models\Kendala;
use App\Models\Opd;
use App\Models\PihakKetiga;
use App\Models\RiwayatTiket;
use App\Models\Tiket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class Phase4AccessAndValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_each_role_can_authenticate(): void
    {
        foreach (['admin', 'opd', 'pihak_ketiga'] as $role) {
            /** @var User $user */
            $user = User::factory()->create([
                'email' => $role.'@example.test',
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

    public function test_login_form_can_authenticate_against_database_without_navigating_away(): void
    {
        /** @var User $user */
        $user = User::factory()->create([
            'nama' => 'Operator Dinas Kesehatan',
            'email' => 'opd-19@siprojar.local',
            'role' => 'opd',
        ]);

        $this->postJson('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])
            ->assertOk()
            ->assertJsonPath('role', 'opd')
            ->assertJsonPath('name', 'Operator Dinas Kesehatan')
            ->assertJsonPath('dashboard_url', url('/opd/dashboard'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_admin_login_redirects_to_admin_dashboard(): void
    {
        /** @var User $user */
        $user = User::factory()->create([
            'nama' => 'Admin Diskominfo',
            'email' => 'admin@malangkab.go.id',
            'role' => 'admin',
            'email_verified_at' => null,
        ]);

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect('/admin/dashboard');

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Opd/Index')
                ->where('role', 'admin'));
    }

    public function test_logout_ends_session_and_login_page_remains_accessible(): void
    {
        /** @var User $user */
        $user = User::factory()->create(['role' => 'opd']);

        $this->actingAs($user)
            ->post('/logout')
            ->assertRedirect('/');

        $this->assertGuest();
        $this->get('/login')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Opd/Index'));
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

    public function test_each_role_uses_the_existing_dashboard_design(): void
    {
        $dashboards = [
            ['role' => 'admin', 'url' => '/admin/dashboard', 'design_role' => 'admin'],
            ['role' => 'opd', 'url' => '/opd/dashboard', 'design_role' => 'opd'],
            ['role' => 'pihak_ketiga', 'url' => '/vendor/dashboard', 'design_role' => 'vendor'],
        ];

        foreach ($dashboards as $dashboard) {
            /** @var User $user */
            $user = User::factory()->create([
                'role' => $dashboard['role'],
                'nama' => 'Pengguna Test',
            ]);

            $this->actingAs($user)
                ->get($dashboard['url'])
                ->assertInertia(fn (Assert $page) => $page
                    ->component('Admin/Opd/Index')
                    ->where('role', $dashboard['design_role'])
                    ->where('userName', 'Pengguna Test'));
        }
    }

    public function test_admin_dashboard_receives_opds_profilings_and_tickets_from_database(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['role' => 'admin']);
        $opd = Opd::create([
            'nama_opd' => 'Dinas Sosial',
            'alamat' => 'Jl. Sosial',
            'jumlah_pegawai' => 60,
        ]);
        $profiling = DataProfiling::create([
            'opd_id' => $opd->id,
            'periode' => '2026-10',
            'jumlah_device' => 12,
            'status_verifikasi' => 'diverifikasi',
        ]);
        $kendala = Kendala::create([
            'data_profiling_id' => $profiling->id,
            'jenis_kendala' => 'device',
            'deskripsi' => 'Switch bermasalah',
        ]);
        $ticket = Tiket::create([
            'nomor_tiket' => 'TKT-TEST-001',
            'kendala_id' => $kendala->id,
            'dibuat_oleh' => $admin->id,
            'urgensi' => 'sedang',
            'status' => 'proses',
        ]);

        $this->actingAs($admin)
            ->get('/admin/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Opd/Index')
                ->has('opds', 1)
                ->where('opds.0.nama_opd', 'Dinas Sosial')
                ->has('users', 1)
                ->where('users.0.nama', $admin->nama)
                ->has('profilings', 1)
                ->where('profilings.0.opd_id', $opd->id)
                ->where('profilings.0.status_verifikasi', 'diverifikasi')
                ->where('tickets.0.id', $ticket->id)
                ->where('tickets.0.status', 'proses')
                ->where('tickets.0.kendala.profiling.opd.nama_opd', 'Dinas Sosial'));
    }

    public function test_vendor_dashboard_only_receives_tickets_assigned_to_its_vendor(): void
    {
        $opd = Opd::create([
            'nama_opd' => 'Dinas Pendidikan',
            'alamat' => 'Jl. Pendidikan',
            'jumlah_pegawai' => 50,
        ]);
        $profiling = DataProfiling::create([
            'opd_id' => $opd->id,
            'periode' => '2026-10',
            'jumlah_device' => 10,
            'status_verifikasi' => 'diverifikasi',
        ]);
        $issue = Kendala::create([
            'data_profiling_id' => $profiling->id,
            'jenis_kendala' => 'device',
            'deskripsi' => 'Switch bermasalah',
        ]);
        $vendorOne = PihakKetiga::create(['nama_vendor' => 'Vendor Satu']);
        $vendorTwo = PihakKetiga::create(['nama_vendor' => 'Vendor Dua']);
        /** @var User $vendorUser */
        $vendorUser = User::factory()->create([
            'role' => 'pihak_ketiga',
            'pihak_ketiga_id' => $vendorOne->id,
        ]);
        $opdUser = User::factory()->create([
            'role' => 'opd',
            'opd_id' => $opd->id,
        ]);
        $assignedTicket = Tiket::create([
            'nomor_tiket' => 'TKT-VENDOR-01',
            'kendala_id' => $issue->id,
            'pihak_ketiga_id' => $vendorOne->id,
            'dibuat_oleh' => $opdUser->id,
            'urgensi' => 'sedang',
            'status' => 'diteruskan',
        ]);
        $otherVendorTicket = Tiket::create([
            'nomor_tiket' => 'TKT-VENDOR-02',
            'kendala_id' => Kendala::create([
                'data_profiling_id' => $profiling->id,
                'jenis_kendala' => 'topologi',
                'deskripsi' => 'Konfigurasi perlu ditinjau',
            ])->id,
            'pihak_ketiga_id' => $vendorTwo->id,
            'dibuat_oleh' => $opdUser->id,
            'urgensi' => 'rendah',
            'status' => 'diteruskan',
        ]);

        $this->actingAs($vendorUser)
            ->get('/vendor/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Opd/Index')
                ->where('role', 'vendor')
                ->where('vendorName', 'Vendor Satu')
                ->has('tickets', 1)
                ->where('tickets.0.id', $assignedTicket->id));

        $this->actingAs($vendorUser)
            ->postJson("/vendor/tiket/{$otherVendorTicket->id}/status", [
                'status' => 'proses',
                'catatan' => 'Tidak boleh mengubah tiket milik vendor lain.',
            ])
            ->assertForbidden();
        $this->assertDatabaseHas('tiket', [
            'id' => $otherVendorTicket->id,
            'status' => 'diteruskan',
        ]);

        /** @var User $unlinkedVendor */
        $unlinkedVendor = User::factory()->create(['role' => 'pihak_ketiga']);
        $this->actingAs($unlinkedVendor)
            ->get('/vendor/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Opd/Index')
                ->where('role', 'vendor')
                ->has('tickets', 0));
        $this->actingAs($unlinkedVendor)
            ->postJson("/vendor/tiket/{$assignedTicket->id}/status", [
                'status' => 'proses',
                'catatan' => 'Akun tanpa relasi vendor tidak dapat mengakses tiket.',
            ])
            ->assertForbidden();
    }

    public function test_admin_can_manage_database_users_and_link_them_to_vendor(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['role' => 'admin']);
        $opd = Opd::create([
            'nama_opd' => 'Dinas Kesehatan',
            'alamat' => 'Jl. Kesehatan',
            'jumlah_pegawai' => 50,
        ]);
        $vendor = PihakKetiga::create([
            'nama_vendor' => 'Vendor Jaringan',
            'jenis_layanan' => 'isp',
        ]);

        $response = $this->actingAs($admin)->postJson('/admin/users', [
            'nama' => 'Petugas Vendor',
            'email' => 'petugas-vendor@example.test',
            'password' => 'password123',
            'role' => 'opd',
            'opd_id' => $opd->id,
            'status' => 'aktif',
        ]);
        $response->assertCreated()
            ->assertJsonPath('user.opd_id', $opd->id)
            ->assertJsonPath('user.opd.nama_opd', 'Dinas Kesehatan');
        $userId = $response->json('user.id');
        $this->assertDatabaseHas('users', [
            'id' => $userId,
            'role' => 'opd',
            'opd_id' => $opd->id,
            'pihak_ketiga_id' => null,
        ]);

        $this->putJson("/admin/users/{$userId}", [
            'nama' => 'Petugas Vendor',
            'email' => 'petugas-vendor@example.test',
            'password' => null,
            'role' => 'pihak_ketiga',
            'pihak_ketiga_id' => $vendor->id,
            'status' => 'nonaktif',
        ])
            ->assertOk()
            ->assertJsonPath('user.role', 'pihak_ketiga')
            ->assertJsonPath('user.opd_id', null)
            ->assertJsonPath('user.pihak_ketiga.nama_vendor', 'Vendor Jaringan')
            ->assertJsonPath('user.status', 'nonaktif');

        $this->deleteJson("/admin/users/{$userId}")
            ->assertOk()
            ->assertJsonPath('message', 'Pengguna berhasil dihapus.');
        $this->assertDatabaseMissing('users', ['id' => $userId]);
    }

    public function test_admin_can_add_vendor_from_ticket_management(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->postJson('/admin/pihak-ketiga', [
                'nama_vendor' => 'Vendor Baru',
                'jenis_layanan' => 'perangkat',
                'kontak_person' => 'Petugas Vendor',
                'nomor_kontak' => '081234567890',
            ])
            ->assertCreated()
            ->assertJsonPath('vendor.nama_vendor', 'Vendor Baru')
            ->assertJsonPath('vendor.jenis_layanan', 'perangkat');

        $this->assertDatabaseHas('pihak_ketiga', [
            'nama_vendor' => 'Vendor Baru',
            'jenis_layanan' => 'perangkat',
        ]);
    }

    public function test_admin_can_manage_opd_records_from_the_dashboard_client(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['role' => 'admin']);

        $create = $this->actingAs($admin)->postJson('/admin/opd', [
            'nama_opd' => 'Dinas Sosial',
            'alamat' => 'Jl. Sosial',
            'jumlah_pegawai' => 60,
        ]);
        $create->assertCreated()
            ->assertJsonPath('opd.nama_opd', 'Dinas Sosial');
        $opdId = $create->json('opd.id');

        $this->putJson("/admin/opd/{$opdId}", [
            'nama_opd' => 'Dinas Sosial Kabupaten',
            'alamat' => 'Jl. Sosial Baru',
            'jumlah_pegawai' => 65,
        ])
            ->assertOk()
            ->assertJsonPath('opd.nama_opd', 'Dinas Sosial Kabupaten');

        $this->deleteJson("/admin/opd/{$opdId}")
            ->assertOk()
            ->assertJsonPath('message', 'Data OPD berhasil dihapus.');
        $this->assertDatabaseMissing('opd', ['id' => $opdId]);
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

    public function test_opd_cannot_create_profiling_without_linked_opd(): void
    {
        /** @var User $user */
        $user = User::factory()->create(['role' => 'opd', 'opd_id' => null]);

        $this->actingAs($user)
            ->postJson('/opd/profiling', [
                'periode' => '2026-10',
                'jumlah_device' => 10,
            ])
            ->assertForbidden()
            ->assertJsonPath('message', 'Akun OPD ini belum terhubung dengan data OPD.');

        $this->assertDatabaseCount('data_profiling', 0);
    }

    public function test_admin_must_link_an_opd_user_to_an_opd(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['role' => 'admin']);
        Opd::create([
            'nama_opd' => 'Dinas Pendidikan',
            'alamat' => 'Jl. Pendidikan',
            'jumlah_pegawai' => 50,
        ]);

        $this->actingAs($admin)
            ->post('/admin/users', [
                'nama' => 'Staf OPD',
                'email' => 'staf@example.test',
                'password' => 'password',
                'role' => 'opd',
                'status' => 'aktif',
            ])
            ->assertSessionHasErrors('opd_id');

        $this->assertDatabaseMissing('users', ['email' => 'staf@example.test']);
    }

    public function test_opd_can_save_profiling_and_see_it_in_history(): void
    {
        $opd = Opd::create([
            'nama_opd' => 'Dinas Pendidikan',
            'alamat' => 'Jl. Pendidikan',
            'jumlah_pegawai' => 50,
        ]);
        $otherOpd = Opd::create([
            'nama_opd' => 'Dinas Kesehatan',
            'alamat' => 'Jl. Kesehatan',
            'jumlah_pegawai' => 30,
        ]);
        /** @var User $user */
        $user = User::factory()->create(['role' => 'opd', 'opd_id' => $opd->id]);

        $this->actingAs($user)
            ->postJson('/opd/profiling', [
                'opd_id' => $otherOpd->id,
                'periode' => '2026-10',
                'jumlah_device' => 10,
                'aplikasi' => ['SIPD'],
                'kendala' => [['jenis_kendala' => 'device', 'deskripsi' => 'Switch bermasalah']],
            ])
            ->assertCreated()
            ->assertJsonPath('profiling.opd_id', $opd->id);

        $this->assertDatabaseHas('data_profiling', [
            'opd_id' => $opd->id,
            'periode' => '2026-10',
            'status_verifikasi' => 'draft',
        ]);
        $this->assertDatabaseMissing('data_profiling', [
            'opd_id' => $otherOpd->id,
            'periode' => '2026-10',
        ]);

        $this->actingAs($user)
            ->get('/opd/profiling')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Profiling/Index')
                ->has('profilings.data', 1)
                ->where('profilings.data.0.periode', '2026-10'));
    }

    public function test_saving_current_period_draft_updates_existing_profiling_instead_of_duplicating(): void
    {
        $currentPeriod = now()->format('Y-m');
        $opd = Opd::create([
            'nama_opd' => 'Dinas Pendidikan',
            'alamat' => 'Jl. Pendidikan',
            'jumlah_pegawai' => 50,
        ]);
        /** @var User $user */
        $user = User::factory()->create(['role' => 'opd', 'opd_id' => $opd->id]);

        $firstSave = $this->actingAs($user)->postJson('/opd/profiling', [
            'periode' => $currentPeriod,
            'jumlah_device' => 10,
            'aplikasi' => ['SIPD'],
        ])->assertCreated();
        $profilingId = $firstSave->json('profiling.id');

        $this->actingAs($user)->postJson('/opd/profiling', [
            'periode' => $currentPeriod,
            'jumlah_device' => 25,
            'aplikasi' => ['SIPROJAR'],
        ])
            ->assertOk()
            ->assertJsonPath('profiling.id', $profilingId)
            ->assertJsonPath('profiling.jumlah_device', 25);

        $this->assertDatabaseCount('data_profiling', 1);
        $this->assertDatabaseCount('aplikasi_digunakan', 1);
        $this->assertDatabaseHas('aplikasi_digunakan', [
            'data_profiling_id' => $profilingId,
            'nama_aplikasi' => 'SIPROJAR',
        ]);
    }

    public function test_opd_cannot_create_a_profiling_for_another_month(): void
    {
        $currentPeriod = now()->format('Y-m');
        $futurePeriod = now()->addMonth()->format('Y-m');
        $opd = Opd::create([
            'nama_opd' => 'Dinas Pendidikan',
            'alamat' => 'Jl. Pendidikan',
            'jumlah_pegawai' => 50,
        ]);
        /** @var User $user */
        $user = User::factory()->create(['role' => 'opd', 'opd_id' => $opd->id]);

        $this->actingAs($user)
            ->postJson('/opd/profiling', [
                'periode' => $currentPeriod,
                'jumlah_device' => 10,
            ])
            ->assertCreated();

        $this->actingAs($user)
            ->postJson('/opd/profiling', [
                'periode' => $futurePeriod,
                'jumlah_device' => 20,
            ])
            ->assertUnprocessable()
            ->assertJsonPath(
                'message',
                'Profiling baru hanya dapat dibuat untuk bulan berjalan. Satu OPD hanya dapat memiliki satu profiling setiap bulan.',
            );

        $this->assertDatabaseCount('data_profiling', 1);
        $this->assertDatabaseHas('data_profiling', [
            'opd_id' => $opd->id,
            'periode' => $currentPeriod,
            'status_verifikasi' => 'draft',
        ]);
    }

    public function test_existing_submitted_profiling_cannot_be_overwritten_by_a_duplicate_period_save(): void
    {
        $currentPeriod = now()->format('Y-m');
        $futurePeriod = now()->addMonth()->format('Y-m');
        $opd = Opd::create([
            'nama_opd' => 'Dinas Pendidikan',
            'alamat' => 'Jl. Pendidikan',
            'jumlah_pegawai' => 50,
        ]);
        /** @var User $user */
        $user = User::factory()->create(['role' => 'opd', 'opd_id' => $opd->id]);

        $submittedResponse = $this->actingAs($user)->postJson('/opd/profiling', [
            'periode' => $currentPeriod,
            'jumlah_device' => 10,
            'kecepatan_unduh' => 100,
            'ping_ms' => 100,
            'ajukan' => true,
        ])
            ->assertCreated()
            ->assertJsonPath('profiling.speed_test.ping_ms', '100.00');

        $this->actingAs($user)->postJson('/opd/profiling', [
            'periode' => $currentPeriod,
            'jumlah_device' => 25,
        ])
            ->assertUnprocessable()
            ->assertJsonPath(
                'message',
                'Profiling periode ini sudah diajukan atau diverifikasi dan tidak dapat ditimpa.',
            );

        $this->assertDatabaseCount('data_profiling', 1);
        $this->assertDatabaseHas('data_profiling', [
            'opd_id' => $opd->id,
            'periode' => $currentPeriod,
            'jumlah_device' => 10,
            'status_verifikasi' => 'diajukan',
        ]);

        $this->actingAs($user)->postJson('/opd/profiling', [
            'periode' => $futurePeriod,
            'jumlah_device' => 25,
            'kecepatan_unduh' => 100,
            'ping_ms' => 50,
            'tanggal_test' => '2026-11-01',
        ])
            ->assertUnprocessable();

        $this->assertDatabaseCount('data_profiling', 1);
        $this->assertDatabaseHas('data_profiling', [
            'opd_id' => $opd->id,
            'periode' => $currentPeriod,
            'status_verifikasi' => 'diajukan',
        ]);
        $this->assertDatabaseMissing('data_profiling', [
            'opd_id' => $opd->id,
            'periode' => $futurePeriod,
        ]);
        $this->assertDatabaseHas('speed_test', [
            'data_profiling_id' => $submittedResponse->json('profiling.id'),
            'ping_ms' => 100,
        ]);

        $this->actingAs($user)
            ->get('/opd/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Opd/Index')
                ->has('profilings', 1));
    }

    public function test_custom_profiling_issue_is_required_and_persisted_with_its_display_name(): void
    {
        $opd = Opd::create([
            'nama_opd' => 'Dinas Pendidikan',
            'alamat' => 'Jl. Pendidikan',
            'jumlah_pegawai' => 50,
        ]);
        /** @var User $user */
        $user = User::factory()->create(['role' => 'opd', 'opd_id' => $opd->id]);
        $payload = [
            'periode' => '2026-10',
            'jumlah_device' => 10,
            'kendala' => [[
                'jenis_kendala' => 'lainnya',
                'deskripsi' => 'Terjadi setiap pagi.',
            ]],
        ];

        $this->actingAs($user)
            ->postJson('/opd/profiling', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('kendala.0.nama_kendala');

        $response = $this->actingAs($user)
            ->postJson('/opd/profiling', [
                ...$payload,
                'kendala' => [[
                    'jenis_kendala' => 'lainnya',
                    'nama_kendala' => 'Wi-Fi ruang pelayanan tidak stabil',
                    'deskripsi' => 'Terjadi setiap pagi.',
                ]],
            ])
            ->assertCreated()
            ->assertJsonPath(
                'profiling.kendala.0.nama_kendala',
                'Wi-Fi ruang pelayanan tidak stabil',
            );

        $this->assertDatabaseHas('kendala', [
            'data_profiling_id' => $response->json('profiling.id'),
            'jenis_kendala' => 'sosialisasi',
            'nama_kendala' => 'Wi-Fi ruang pelayanan tidak stabil',
            'deskripsi' => 'Terjadi setiap pagi.',
        ]);

        $this->actingAs($user)
            ->get('/opd/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Opd/Index')
                ->where(
                    'profilings.0.kendala.0.nama_kendala',
                    'Wi-Fi ruang pelayanan tidak stabil',
                ));
    }

    public function test_opd_profiling_can_be_verified_and_used_to_create_a_ticket(): void
    {
        $opd = Opd::create([
            'nama_opd' => 'Dinas Pendidikan',
            'alamat' => 'Jl. Pendidikan',
            'jumlah_pegawai' => 50,
        ]);
        /** @var User $user */
        $user = User::factory()->create(['role' => 'opd', 'opd_id' => $opd->id]);
        /** @var User $admin */
        $admin = User::factory()->create(['role' => 'admin']);

        $profilingResponse = $this->actingAs($user)->postJson('/opd/profiling', [
            'periode' => '2026-10',
            'jumlah_device' => 10,
            'nama_isp' => 'ISP Uji',
            'bandwidth_mbps' => 100,
            'aplikasi' => ['SIPD'],
            'kecepatan_unduh' => 75,
            'kecepatan_unggah' => 30,
            'hasil' => 'sesuai',
            'tanggal_test' => '2026-10-01',
            'kendala' => [[
                'jenis_kendala' => 'device',
                'deskripsi' => 'Switch bermasalah',
            ]],
            'ajukan' => true,
        ]);

        $profilingResponse->assertCreated()
            ->assertJsonPath('profiling.status_verifikasi', 'diajukan');
        $profilingId = $profilingResponse->json('profiling.id');

        $this->assertDatabaseHas('koneksi_internet', [
            'opd_id' => $opd->id,
            'nama_isp' => 'ISP Uji',
            'bandwidth_mbps' => 100,
        ]);

        $this->actingAs($admin)
            ->postJson("/admin/profiling/{$profilingId}/verify", [
                'kesimpulan' => 'Kondisi jaringan baik dan dapat digunakan.',
            ])
            ->assertOk()
            ->assertJsonPath('profiling.status_verifikasi', 'diverifikasi');

        $kendala = Kendala::where('data_profiling_id', $profilingId)->firstOrFail();
        $ticketResponse = $this->actingAs($user)->postJson('/opd/tiket', [
            'kendala_id' => $kendala->id,
            'urgensi' => 'sedang',
        ]);

        $ticketResponse->assertCreated();
        $this->actingAs($user)
            ->get('/opd/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Opd/Index')
                ->where('opdName', 'Dinas Pendidikan')
                ->has('profilings', 1)
                ->where('profilings.0.status_verifikasi', 'diverifikasi')
                ->where(
                    'profilings.0.kendala.0.tiket.nomor_tiket',
                    $ticketResponse->json('ticket.nomor_tiket'),
                )
                ->has('tickets', 1)
                ->where('tickets.0.nomor_tiket', $ticketResponse->json('ticket.nomor_tiket')));
    }

    public function test_opd_can_submit_a_ticket_and_see_it_in_ticket_monitoring(): void
    {
        $opd = Opd::create([
            'nama_opd' => 'Dinas Pendidikan',
            'alamat' => 'Jl. Pendidikan',
            'jumlah_pegawai' => 50,
        ]);
        /** @var User $user */
        $user = User::factory()->create(['role' => 'opd', 'opd_id' => $opd->id]);
        $profiling = DataProfiling::create([
            'opd_id' => $opd->id,
            'periode' => '2026-10',
            'jumlah_device' => 10,
            'status_verifikasi' => 'diverifikasi',
        ]);
        $kendala = Kendala::create([
            'data_profiling_id' => $profiling->id,
            'jenis_kendala' => 'device',
            'deskripsi' => 'Switch bermasalah',
        ]);

        $this->actingAs($user)
            ->post('/opd/tiket', ['kendala_id' => $kendala->id, 'urgensi' => 'sedang'])
            ->assertRedirect('/tiket');

        $this->assertDatabaseHas('tiket', [
            'kendala_id' => $kendala->id,
            'dibuat_oleh' => $user->id,
            'status' => 'baru',
        ]);

        $this->actingAs($user)
            ->get('/tiket')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Tiket/Index')
                ->has('tickets.data', 1)
                ->where('tickets.data.0.status', 'baru'));

        $this->actingAs($user)
            ->postJson('/opd/tiket', [
                'kendala_id' => $kendala->id,
                'urgensi' => 'sedang',
            ])
            ->assertUnprocessable()
            ->assertJsonPath(
                'message',
                'Kendala ini sudah memiliki tiket. Pantau tiket yang sudah diajukan.',
            );
        $this->assertDatabaseCount('tiket', 1);
    }

    public function test_opd_can_only_create_ticket_from_issue_in_verified_profiling(): void
    {
        $opd = Opd::create([
            'nama_opd' => 'Dinas Pendidikan',
            'alamat' => 'Jl. Pendidikan',
            'jumlah_pegawai' => 50,
        ]);
        /** @var User $user */
        $user = User::factory()->create(['role' => 'opd', 'opd_id' => $opd->id]);
        DataProfiling::create([
            'opd_id' => $opd->id,
            'periode' => '2026-09',
            'jumlah_device' => 10,
            'status_verifikasi' => 'diverifikasi',
        ]);
        $profiling = DataProfiling::create([
            'opd_id' => $opd->id,
            'periode' => '2026-10',
            'jumlah_device' => 10,
            'status_verifikasi' => 'draft',
        ]);
        $kendala = Kendala::create([
            'data_profiling_id' => $profiling->id,
            'jenis_kendala' => 'device',
            'deskripsi' => 'Switch bermasalah',
        ]);

        $this->actingAs($user)
            ->postJson('/opd/tiket', [
                'kendala_id' => $kendala->id,
                'urgensi' => 'sedang',
            ])
            ->assertUnprocessable()
            ->assertJsonPath(
                'message',
                'Tiket hanya dapat diajukan untuk kendala dari profiling yang sudah diverifikasi.',
            );

        $this->assertDatabaseCount('tiket', 0);
    }

    public function test_ticket_cannot_create_a_new_issue_outside_profiling(): void
    {
        $opd = Opd::create([
            'nama_opd' => 'Dinas Pendidikan',
            'alamat' => 'Jl. Pendidikan',
            'jumlah_pegawai' => 50,
        ]);
        /** @var User $user */
        $user = User::factory()->create(['role' => 'opd', 'opd_id' => $opd->id]);
        DataProfiling::create([
            'opd_id' => $opd->id,
            'periode' => '2026-10',
            'jumlah_device' => 10,
            'status_verifikasi' => 'diverifikasi',
        ]);

        $this->actingAs($user)
            ->postJson('/opd/tiket', [
                'jenis_kendala' => 'Perangkat Rusak',
                'deskripsi' => 'Switch baru bermasalah.',
                'urgensi' => 'sedang',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('kendala_id');

        $this->assertDatabaseCount('kendala', 0);
        $this->assertDatabaseCount('tiket', 0);
    }

    public function test_admin_can_forward_database_ticket_to_vendor(): void
    {
        $opd = Opd::create([
            'nama_opd' => 'Dinas Sosial',
            'alamat' => 'Jl. Sosial',
            'jumlah_pegawai' => 60,
        ]);
        /** @var User $admin */
        $admin = User::factory()->create(['role' => 'admin']);
        $vendor = PihakKetiga::create([
            'nama_vendor' => 'Vendor Uji',
            'jenis_layanan' => 'perangkat',
            'kontak_person' => 'Petugas Vendor',
            'nomor_kontak' => '081234567890',
        ]);
        $user = User::factory()->create(['role' => 'opd', 'opd_id' => $opd->id]);
        $profiling = DataProfiling::create([
            'opd_id' => $opd->id,
            'periode' => '2026-10',
            'jumlah_device' => 10,
            'status_verifikasi' => 'diverifikasi',
        ]);
        $kendala = Kendala::create([
            'data_profiling_id' => $profiling->id,
            'jenis_kendala' => 'device',
            'deskripsi' => 'Switch bermasalah',
        ]);
        $ticket = Tiket::create([
            'nomor_tiket' => 'TKT-TEST-FWD',
            'kendala_id' => $kendala->id,
            'dibuat_oleh' => $user->id,
            'urgensi' => 'sedang',
            'status' => 'baru',
        ]);

        $this->actingAs($admin)
            ->postJson("/admin/tiket/{$ticket->id}/forward", [
                'ditangani_internal' => false,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('pihak_ketiga_id');

        $this->assertDatabaseHas('tiket', [
            'id' => $ticket->id,
            'status' => 'baru',
            'pihak_ketiga_id' => null,
        ]);

        $this->actingAs($admin)
            ->postJson("/admin/tiket/{$ticket->id}/forward", [
                'pihak_ketiga_id' => $vendor->id,
                'ditangani_internal' => false,
            ])
            ->assertOk()
            ->assertJsonPath('ticket.status', 'diteruskan')
            ->assertJsonPath('ticket.pihak_ketiga.id', $vendor->id);

        $this->assertDatabaseHas('tiket', [
            'id' => $ticket->id,
            'status' => 'diteruskan',
            'pihak_ketiga_id' => $vendor->id,
        ]);
        $this->assertDatabaseHas('riwayat_tiket', [
            'tiket_id' => $ticket->id,
            'status_baru' => 'diteruskan',
        ]);
    }

    public function test_opd_ticket_form_creates_ticket_and_history_for_verified_profile(): void
    {
        $opd = Opd::create([
            'nama_opd' => 'Dinas Pendidikan',
            'alamat' => 'Jl. Pendidikan',
            'jumlah_pegawai' => 50,
        ]);
        /** @var User $user */
        $user = User::factory()->create(['role' => 'opd', 'opd_id' => $opd->id]);
        $profiling = DataProfiling::create([
            'opd_id' => $opd->id,
            'periode' => '2026-10',
            'jumlah_device' => 10,
            'status_verifikasi' => 'diverifikasi',
        ]);
        $kendala = Kendala::create([
            'data_profiling_id' => $profiling->id,
            'jenis_kendala' => 'device',
            'deskripsi' => 'Switch lantai dua tidak menyala.',
        ]);

        $response = $this->actingAs($user)->postJson('/opd/tiket', [
            'kendala_id' => $kendala->id,
            'urgensi' => 'sedang',
        ]);

        $response->assertCreated()
            ->assertJsonPath('ticket.status', 'baru')
            ->assertJsonPath('ticket.kendala.jenis_kendala', 'device')
            ->assertJsonPath('ticket.kendala.profiling.opd_id', $opd->id);

        $this->assertDatabaseHas('kendala', [
            'id' => $kendala->id,
            'data_profiling_id' => $profiling->id,
            'jenis_kendala' => 'device',
            'deskripsi' => 'Switch lantai dua tidak menyala.',
        ]);
        $this->assertDatabaseHas('tiket', [
            'dibuat_oleh' => $user->id,
            'status' => 'baru',
        ]);
        $this->assertDatabaseHas('riwayat_tiket', [
            'user_id' => $user->id,
            'status_baru' => 'baru',
            'catatan' => 'Tiket dibuat oleh OPD',
        ]);

        $this->actingAs($user)
            ->get('/opd/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Opd/Index')
                ->has('tickets', 1)
                ->where('tickets.0.nomor_tiket', $response->json('ticket.nomor_tiket')));
    }

    public function test_opd_cannot_receive_success_for_ticket_without_verified_profiling(): void
    {
        $opd = Opd::create([
            'nama_opd' => 'Dinas Pendidikan',
            'alamat' => 'Jl. Pendidikan',
            'jumlah_pegawai' => 50,
        ]);
        /** @var User $user */
        $user = User::factory()->create(['role' => 'opd', 'opd_id' => $opd->id]);

        $this->actingAs($user)->postJson('/opd/tiket', [
            'jenis_kendala' => 'Koneksi Putus',
            'deskripsi' => 'Koneksi internet tidak dapat digunakan.',
            'urgensi' => 'sedang',
        ])
            ->assertUnprocessable()
            ->assertJsonPath(
                'message',
                'Tiket belum dapat diajukan karena belum ada profiling terverifikasi. Ajukan profiling terlebih dahulu dan tunggu verifikasi Admin.',
            );

        $this->assertDatabaseCount('kendala', 0);
        $this->assertDatabaseCount('tiket', 0);
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
            ->postJson('/vendor/tiket/'.$ticket->id.'/status', [
                'status' => 'proses',
                'catatan' => 'Tiket diterima vendor dan penanganan dimulai.',
            ])
            ->assertOk()
            ->assertJsonPath('ticket.status', 'proses');
        $this->assertDatabaseHas('tiket', ['id' => $ticket->id, 'status' => 'proses']);

        $this->actingAs($vendorUser)
            ->postJson('/vendor/tiket/'.$ticket->id.'/status', [
                'status' => 'menunggu_verifikasi',
                'catatan' => 'Bukti penyelesaian wajib diunggah.',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('bukti_file');

        /** @var User $admin */
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)
            ->postJson('/admin/tiket/'.$ticket->id.'/status', [
                'status' => 'selesai',
                'catatan' => 'Tidak boleh selesai tanpa bukti verifikasi.',
            ])
            ->assertUnprocessable();

        $this->actingAs($vendorUser)
            ->post('/vendor/tiket/'.$ticket->id.'/status', [
                'status' => 'menunggu_verifikasi',
                'catatan' => 'Format bukti tidak didukung.',
                'bukti_file' => UploadedFile::fake()->create('bukti.txt', 10, 'text/plain'),
            ])
            ->assertSessionHasErrors('bukti_file');

        $this->actingAs($vendorUser)
            ->post('/vendor/tiket/'.$ticket->id.'/status', [
                'status' => 'menunggu_verifikasi',
                'catatan' => 'Perangkat diganti dan pengujian selesai.',
                'bukti_file' => UploadedFile::fake()->createWithContent(
                    'bukti.pdf',
                    "%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF",
                ),
            ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('ticket.status', 'menunggu_verifikasi');

        $history = RiwayatTiket::where('tiket_id', $ticket->id)->latest('id')->firstOrFail();
        $this->assertDatabaseHas('tiket', ['id' => $ticket->id, 'status' => 'menunggu_verifikasi']);
        $this->assertNotNull($history->bukti_file);
        $this->assertTrue(Storage::disk('local')->exists($history->bukti_file));
        $this->actingAs($vendorUser)->get('/tiket/bukti/'.$history->id)->assertOk();

        $otherOpd = Opd::create([
            'nama_opd' => 'Dinas Kesehatan',
            'alamat' => 'Jl. Kesehatan',
            'jumlah_pegawai' => 70,
        ]);
        /** @var User $otherOpdUser */
        $otherOpdUser = User::factory()->create(['role' => 'opd', 'opd_id' => $otherOpd->id]);
        $this->actingAs($otherOpdUser)->get('/tiket/bukti/'.$history->id)->assertForbidden();

        $this->actingAs($admin)
            ->postJson('/admin/tiket/'.$ticket->id.'/status', [
                'status' => 'selesai',
                'catatan' => 'Bukti penanganan diverifikasi Admin.',
            ])
            ->assertOk()
            ->assertJsonPath('ticket.status', 'selesai');
        $this->assertDatabaseHas('tiket', [
            'id' => $ticket->id,
            'status' => 'selesai',
        ]);
    }
}
