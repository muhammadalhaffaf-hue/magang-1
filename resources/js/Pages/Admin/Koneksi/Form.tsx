import { Form, Link } from "@inertiajs/react";
export default function FormPage({ connection, opds }: any) {
    const edit = Boolean(connection?.id);
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-xl rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-2xl font-bold">
                    {edit ? "Edit" : "Tambah"} Koneksi Internet
                </h1>
                <Form
                    action={
                        edit
                            ? route("koneksi-internet.update", connection.id)
                            : route("koneksi-internet.store")
                    }
                    method={edit ? "put" : "post"}
                    className="grid gap-3"
                >
                    <select
                        name="opd_id"
                        defaultValue={connection?.opd_id ?? ""}
                        className="rounded border p-2"
                    >
                        <option value="">Pilih OPD</option>
                        {opds.map((opd: any) => (
                            <option key={opd.id} value={opd.id}>
                                {opd.nama_opd}
                            </option>
                        ))}
                    </select>
                    <input
                        name="nama_isp"
                        placeholder="Nama ISP"
                        defaultValue={connection?.nama_isp ?? ""}
                        className="rounded border p-2"
                    />
                    <input
                        name="bandwidth_mbps"
                        type="number"
                        step="0.01"
                        placeholder="Bandwidth Mbps"
                        defaultValue={connection?.bandwidth_mbps ?? ""}
                        className="rounded border p-2"
                    />
                    <input
                        name="tanggal_aktif"
                        type="date"
                        defaultValue={
                            connection?.tanggal_aktif?.slice?.(0, 10) ?? ""
                        }
                        className="rounded border p-2"
                    />
                    <select
                        name="status"
                        defaultValue={connection?.status ?? "aktif"}
                        className="rounded border p-2"
                    >
                        <option value="aktif">Aktif</option>
                        <option value="bermasalah">Bermasalah</option>
                        <option value="tidak_aktif">Tidak aktif</option>
                    </select>
                    <button className="rounded bg-blue-600 p-2 text-white">
                        Simpan
                    </button>
                    <Link
                        href={route("koneksi-internet.index")}
                        className="text-center text-blue-600"
                    >
                        Kembali
                    </Link>
                </Form>
            </div>
        </div>
    );
}
