import { useState } from "react";
import { Form, Link } from "@inertiajs/react";
export default function FormPage({ profiling, opds }: any) {
    const edit = Boolean(profiling?.id);
    const [issueType, setIssueType] = useState(
        profiling?.kendala?.[0]?.nama_kendala ? "lainnya" : "",
    );
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-2xl rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-2xl font-bold">
                    {edit ? "Edit" : "Isi"} Profiling
                </h1>
                <Form
                    action={
                        edit
                            ? route("profiling.update", profiling.id)
                            : route("profiling.store")
                    }
                    method={edit ? "put" : "post"}
                    className="grid gap-3"
                >
                    <select
                        name="opd_id"
                        defaultValue={profiling?.opd_id ?? ""}
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
                        name="periode"
                        required
                        placeholder="Periode, contoh: 2026"
                        defaultValue={profiling?.periode ?? ""}
                        className="rounded border p-2"
                    />
                    <input
                        name="jumlah_device"
                        required
                        type="number"
                        min="0"
                        placeholder="Jumlah device"
                        defaultValue={profiling?.jumlah_device ?? 0}
                        className="rounded border p-2"
                    />
                    <input
                        name="aplikasi[]"
                        placeholder="Nama aplikasi utama"
                        className="rounded border p-2"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            name="kecepatan_unduh"
                            type="number"
                            step="0.01"
                            placeholder="Download Mbps"
                            className="rounded border p-2"
                        />
                        <input
                            name="kecepatan_unggah"
                            type="number"
                            step="0.01"
                            placeholder="Upload Mbps"
                            className="rounded border p-2"
                        />
                    </div>
                    <select
                        name="hasil"
                        defaultValue="sesuai"
                        className="rounded border p-2"
                    >
                        <option value="sesuai">Sesuai</option>
                        <option value="tidak_sesuai">Tidak sesuai</option>
                    </select>
                    <select
                        name="kendala[0][jenis_kendala]"
                        value={issueType}
                        onChange={(event) => setIssueType(event.target.value)}
                        className="rounded border p-2"
                    >
                        <option value="">Tidak ada kendala</option>
                        <option value="bandwidth_kurang">
                            Bandwidth kurang
                        </option>
                        <option value="device">Device</option>
                        <option value="topologi">Topologi</option>
                        <option value="sosialisasi">Sosialisasi</option>
                        <option value="lainnya">Lainnya</option>
                    </select>
                    {issueType === "lainnya" && (
                        <input
                            name="kendala[0][nama_kendala]"
                            required
                            maxLength={150}
                            placeholder="Sebutkan kendala lainnya"
                            defaultValue={profiling?.kendala?.[0]?.nama_kendala ?? ""}
                            className="rounded border p-2"
                        />
                    )}
                    <textarea
                        name="kesimpulan"
                        placeholder="Kesimpulan"
                        defaultValue={profiling?.kesimpulan ?? ""}
                        className="rounded border p-2"
                    />
                    <label className="flex gap-2">
                        <input type="checkbox" name="ajukan" value="1" /> Ajukan
                        untuk verifikasi
                    </label>
                    <button className="rounded bg-blue-600 p-2 text-white">
                        Simpan
                    </button>
                    <Link
                        href={route("profiling.index")}
                        className="text-center text-blue-600"
                    >
                        Kembali
                    </Link>
                </Form>
            </div>
        </div>
    );
}
