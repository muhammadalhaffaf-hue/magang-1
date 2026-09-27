import { Form, Link } from "@inertiajs/react";
export default function Show({ ticket, role }: any) {
    const statusRoute =
        role === "pihak_ketiga" ? "vendor.tiket.status" : "tiket.status";
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-3xl rounded bg-white p-6 shadow">
                <div className="mb-4 flex justify-between">
                    <h1 className="text-2xl font-bold">{ticket.nomor_tiket}</h1>
                    <Link href={route("tiket.index")} className="text-blue-600">
                        Kembali
                    </Link>
                </div>
                <p>Status: {ticket.status}</p>
                <p>Kendala: {ticket.kendala?.jenis_kendala}</p>
                <p className="mb-4">
                    Vendor:{" "}
                    {ticket.pihak_ketiga?.nama_vendor ??
                        (ticket.ditangani_internal
                            ? "Internal"
                            : "Belum ditentukan")}
                </p>
                {role !== "opd" && ticket.status !== "selesai" ? (
                    <Form
                        action={route(statusRoute, ticket.id)}
                        method="post"
                        className="grid gap-3"
                    >
                        <select
                            name="status"
                            defaultValue="proses"
                            className="rounded border p-2"
                        >
                            <option value="proses">Proses</option>
                            <option value="menunggu_verifikasi">
                                Menunggu verifikasi
                            </option>
                            <option value="selesai">Selesai</option>
                            <option value="ditolak">Ditolak</option>
                        </select>
                        <textarea
                            name="catatan"
                            required
                            placeholder="Catatan tindakan"
                            className="rounded border p-2"
                        />
                        <button className="rounded bg-blue-600 p-2 text-white">
                            Perbarui Status
                        </button>
                    </Form>
                ) : null}
                <h2 className="mt-6 font-bold">Riwayat</h2>
                {ticket.riwayat?.map((item: any) => (
                    <div key={item.id} className="border-t py-2">
                        <b>{item.status_baru}</b>: {item.catatan}
                    </div>
                ))}
            </div>
        </div>
    );
}
