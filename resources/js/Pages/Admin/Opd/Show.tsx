import { Link } from "@inertiajs/react";

type Opd = {
    id: number;
    nama_opd: string;
    alamat?: string | null;
    kecamatan?: string | null;
    jumlah_pegawai: number;
    penanggung_jawab?: string | null;
    kontak?: string | null;
    users_count?: number;
    data_profiling_count?: number;
    tiket_count?: number;
};

export default function Show({ opd }: { opd: Opd }) {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow">
                <div className="mb-6 flex justify-between">
                    <h1 className="text-2xl font-bold">{opd.nama_opd}</h1>
                    <Link href="/admin/opd" className="text-blue-600">
                        Kembali
                    </Link>
                </div>
                <dl className="grid gap-4 md:grid-cols-2">
                    <div>
                        <dt className="text-sm text-gray-500">Alamat</dt>
                        <dd>{opd.alamat || "-"}</dd>
                    </div>
                    <div>
                        <dt className="text-sm text-gray-500">Kecamatan</dt>
                        <dd>{opd.kecamatan || "-"}</dd>
                    </div>
                    <div>
                        <dt className="text-sm text-gray-500">
                            Jumlah pegawai
                        </dt>
                        <dd>{opd.jumlah_pegawai}</dd>
                    </div>
                    <div>
                        <dt className="text-sm text-gray-500">Kontak</dt>
                        <dd>{opd.kontak || "-"}</dd>
                    </div>
                    <div>
                        <dt className="text-sm text-gray-500">Pengguna</dt>
                        <dd>{opd.users_count ?? 0}</dd>
                    </div>
                    <div>
                        <dt className="text-sm text-gray-500">Profiling</dt>
                        <dd>{opd.data_profiling_count ?? 0}</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}
