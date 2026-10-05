import { Form, Link } from "@inertiajs/react";
export default function FormPage({ kendala }: any) {
    const labels: Record<string, string> = {
        bandwidth_kurang: "Speed Lambat",
        device: "Perangkat Rusak",
        topologi: "Konfigurasi Jaringan",
        sosialisasi: "Sosialisasi / Lainnya",
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-xl rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-2xl font-bold">Ajukan Tiket</h1>
                {kendala.length === 0 ? (
                    <div className="grid gap-4">
                        <p className="text-sm text-slate-600">
                            Belum ada kendala dari profiling terverifikasi yang
                            dapat diajukan sebagai tiket.
                        </p>
                        <Link
                            href={route("tiket.index")}
                            className="text-center text-blue-600"
                        >
                            Kembali
                        </Link>
                    </div>
                ) : (
                <Form
                    action={route("tiket.store")}
                    method="post"
                    className="grid gap-3"
                >
                    <select
                        name="kendala_id"
                        required
                        className="rounded border p-2"
                    >
                        <option value="">Pilih kendala</option>
                        {kendala.map((item: any) => (
                            <option key={item.id} value={item.id}>
                                {item.nama_kendala?.trim() ||
                                    labels[item.jenis_kendala] ||
                                    item.jenis_kendala}
                                {item.deskripsi ? ` — ${item.deskripsi}` : ""}
                            </option>
                        ))}
                    </select>
                    <select
                        name="urgensi"
                        defaultValue="sedang"
                        className="rounded border p-2"
                    >
                        <option value="rendah">Rendah</option>
                        <option value="sedang">Sedang</option>
                        <option value="tinggi">Tinggi</option>
                    </select>
                    <button className="rounded bg-blue-600 p-2 text-white">
                        Ajukan
                    </button>
                    <Link
                        href={route("tiket.index")}
                        className="text-center text-blue-600"
                    >
                        Kembali
                    </Link>
                </Form>
                )}
            </div>
        </div>
    );
}
