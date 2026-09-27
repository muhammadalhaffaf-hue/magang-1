import { Form, Link } from "@inertiajs/react";
export default function FormPage({ vendor }: any) {
    const edit = Boolean(vendor?.id);
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-xl rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-2xl font-bold">
                    {edit ? "Edit" : "Tambah"} Pihak Ketiga
                </h1>
                <Form
                    action={
                        edit
                            ? route("pihak-ketiga.update", vendor.id)
                            : route("pihak-ketiga.store")
                    }
                    method={edit ? "put" : "post"}
                    className="grid gap-3"
                >
                    <input
                        name="nama_vendor"
                        placeholder="Nama vendor"
                        defaultValue={vendor?.nama_vendor ?? ""}
                        className="rounded border p-2"
                    />
                    <select
                        name="jenis_layanan"
                        defaultValue={vendor?.jenis_layanan ?? "lainnya"}
                        className="rounded border p-2"
                    >
                        <option value="isp">ISP</option>
                        <option value="perangkat">Perangkat</option>
                        <option value="lainnya">Lainnya</option>
                    </select>
                    <input
                        name="kontak_person"
                        placeholder="Kontak person"
                        defaultValue={vendor?.kontak_person ?? ""}
                        className="rounded border p-2"
                    />
                    <input
                        name="nomor_kontak"
                        placeholder="Nomor kontak"
                        defaultValue={vendor?.nomor_kontak ?? ""}
                        className="rounded border p-2"
                    />
                    <button className="rounded bg-blue-600 p-2 text-white">
                        Simpan
                    </button>
                    <Link
                        href={route("pihak-ketiga.index")}
                        className="text-center text-blue-600"
                    >
                        Kembali
                    </Link>
                </Form>
            </div>
        </div>
    );
}
