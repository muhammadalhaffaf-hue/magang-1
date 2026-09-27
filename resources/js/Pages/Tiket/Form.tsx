import { Form, Link } from "@inertiajs/react";
export default function FormPage({ kendala }: any) {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-xl rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-2xl font-bold">Ajukan Tiket</h1>
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
                                {item.jenis_kendala} -{" "}
                                {item.profiling?.opd?.nama_opd}
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
            </div>
        </div>
    );
}
