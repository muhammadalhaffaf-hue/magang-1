<?php

namespace Tests\Feature\Auth;

use App\Models\DataProfiling;
use App\Models\Kendala;
use App\Models\Opd;
use App\Models\SpeedTest;
use App\Models\Tiket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_login_screen_uses_database_metrics(): void
    {
        $opd = Opd::query()->create(['nama_opd' => 'Dinas Uji']);
        $profiling = DataProfiling::query()->create([
            'opd_id' => $opd->id,
            'periode' => '2026-10',
        ]);
        $secondProfiling = DataProfiling::query()->create([
            'opd_id' => $opd->id,
            'periode' => '2026-09',
        ]);

        foreach ([
            [$profiling, 'sesuai'],
            [$secondProfiling, 'tidak_sesuai'],
        ] as [$record, $result]) {
            SpeedTest::query()->create([
                'data_profiling_id' => $record->id,
                'kecepatan_unduh' => 50,
                'kecepatan_unggah' => 10,
                'hasil' => $result,
                'tanggal_test' => '2026-10-06',
            ]);
        }

        $user = User::factory()->create(['role' => 'admin']);
        $issue = Kendala::query()->create([
            'data_profiling_id' => $profiling->id,
            'jenis_kendala' => 'device',
        ]);
        Tiket::query()->create([
            'nomor_tiket' => 'TKT-2026-0001',
            'kendala_id' => $issue->id,
            'dibuat_oleh' => $user->id,
            'status' => 'selesai',
        ]);

        $this->get('/login')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Opd/Index')
                ->where('landingStats.opds', 1)
                ->where('landingStats.speedTestCompliance', 50)
                ->where('landingStats.resolvedTickets', 1));
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
