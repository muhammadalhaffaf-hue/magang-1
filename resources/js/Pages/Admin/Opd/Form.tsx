import { Form, Link } from "@inertiajs/react";

type Opd = {
    id?: number;
    nama_opd?: string;
    alamat?: string | null;
    kecamatan?: string | null;
    jumlah_pegawai?: number;
    penanggung_jawab?: string | null;
    kontak?: string | null;
};

export default function FormPage({ opd }: { opd: Opd | null }) {
    const editing = Boolean(opd?.id);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {editing ? "Edit OPD" : "Tambah OPD"}
                    </h1>
                    <Link href="/admin/opd" className="text-sm text-blue-600">
                        Kembali
                    </Link>
                </div>
                <Form
                    action={editing ? `/admin/opd/${opd?.id}` : "/admin/opd"}
                    method={editing ? "put" : "post"}
                    className="grid gap-4 md:grid-cols-2"
                >
                    {({ errors, processing }) => (
                        <>
                            <label className="md:col-span-2">
                                Nama OPD
                                <input
                                    name="nama_opd"
                                    defaultValue={opd?.nama_opd ?? ""}
                                    className="mt-1 w-full rounded border p-2"
                                />
                                {errors.nama_opd && (
                                    <span className="text-sm text-red-600">
                                        {errors.nama_opd}
                                    </span>
                                )}
                            </label>
                            <label>
                                Jumlah Pegawai
                                <input
                                    name="jumlah_pegawai"
                                    type="number"
                                    min="0"
                                    defaultValue={opd?.jumlah_pegawai ?? 0}
                                    className="mt-1 w-full rounded border p-2"
                                />
                                {errors.jumlah_pegawai && (
                                    <span className="text-sm text-red-600">
                                        {errors.jumlah_pegawai}
                                    </span>
                                )}
                            </label>
                            <label>
                                Kecamatan
                                <input
                                    name="kecamatan"
                                    defaultValue={opd?.kecamatan ?? ""}
                                    className="mt-1 w-full rounded border p-2"
                                />
                            </label>
                            <label>
                                Penanggung Jawab
                                <input
                                    name="penanggung_jawab"
                                    defaultValue={opd?.penanggung_jawab ?? ""}
                                    className="mt-1 w-full rounded border p-2"
                                />
                            </label>
                            <label>
                                Kontak
                                <input
                                    name="kontak"
                                    defaultValue={opd?.kontak ?? ""}
                                    className="mt-1 w-full rounded border p-2"
                                />
                            </label>
                            <label className="md:col-span-2">
                                Alamat
                                <textarea
                                    name="alamat"
                                    defaultValue={opd?.alamat ?? ""}
                                    className="mt-1 w-full rounded border p-2"
                                    rows={3}
                                />
                            </label>
                            <button
                                disabled={processing}
                                className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50 md:col-span-2"
                            >
                                {processing ? "Menyimpan..." : "Simpan"}
                            </button>
                        </>
                    )}
                </Form>
            </div>
        </div>
    );
}
