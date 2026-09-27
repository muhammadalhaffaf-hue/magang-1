<?php

namespace Tests\Feature;

use App\Models\Opd;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
