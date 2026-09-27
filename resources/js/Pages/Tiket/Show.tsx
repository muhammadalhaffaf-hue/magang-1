import { Form, Link } from "@inertiajs/react";
import { useState } from "react";
import { CheckCircle2, Download, FileUp } from "lucide-react";
export default function Show({ ticket, role }: any) {
    const [status, setStatus] = useState("proses");
    const statusRoute =
        role === "pihak_ketiga" ? "vendor.tiket.status" : "tiket.status";
    const isVendor = role === "pihak_ketiga";
    const isAwaitingEvidence =
        status === "menunggu_verifikasi" || status === "selesai";
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
                {isVendor && ticket.status === "diteruskan" ? (
                    <Form
                        action={route(statusRoute, ticket.id)}
                        method="post"
                        className="mb-5"
                    >
                        <input type="hidden" name="status" value="proses" />
                        <input
                            type="hidden"
                            name="catatan"
                            value="Vendor menerima tiket dan mulai melakukan penanganan."
                        />
                        <button className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
                            <CheckCircle2 size={17} /> Terima &amp; Mulai Proses
                        </button>
                    </Form>
                ) : null}
                {role !== "opd" &&
                ticket.status !== "selesai" &&
                (!isVendor || ticket.status !== "diteruskan") ? (
                    <Form
                        action={route(statusRoute, ticket.id)}
                        method="post"
                        forceFormData
                        className="grid gap-3"
                    >
                        <select
                            name="status"
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="rounded border p-2"
                        >
                            {isVendor ? (
                                <>
                                    <option value="proses">Proses</option>
                                    <option value="menunggu_verifikasi">
                                        Menunggu verifikasi
                                    </option>
                                </>
                            ) : (
                                <>
                                    <option value="proses">Proses</option>
                                    <option value="selesai">Selesai</option>
                                    <option value="ditolak">Ditolak</option>
                                </>
                            )}
                        </select>
                        <textarea
                            name="catatan"
                            required
                            placeholder="Catatan tindakan"
                            className="rounded border p-2"
                        />
                        {isAwaitingEvidence ? (
                            <label className="grid gap-2 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-4 text-sm text-slate-600">
                                <span className="flex items-center gap-2 font-semibold text-slate-700">
                                    <FileUp
                                        size={17}
                                        className="text-blue-700"
                                    />{" "}
                                    Bukti penanganan{" "}
                                    {status === "menunggu_verifikasi"
                                        ? "(wajib)"
                                        : "(jika tersedia)"}
                                </span>
                                <input
                                    type="file"
                                    name="bukti_file"
                                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                                    required={status === "menunggu_verifikasi"}
                                    className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-100 file:px-3 file:py-2 file:font-semibold file:text-blue-800"
                                />
                                <span className="text-xs text-slate-500">
                                    Format JPG, PNG, PDF; maksimal 5 MB.
                                </span>
                            </label>
                        ) : null}
                        <button className="rounded bg-blue-600 p-2 text-white">
                            Perbarui Status
                        </button>
                    </Form>
                ) : null}
                <h2 className="mt-6 font-bold">Riwayat</h2>
                {ticket.riwayat?.map((item: any) => (
                    <div key={item.id} className="border-t py-2">
                        <b>{item.status_baru}</b>: {item.catatan}
                        {item.bukti_file ? (
                            <a
                                href={route("tiket.evidence", item.id)}
                                className="mt-1 inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"
                            >
                                <Download size={14} /> Unduh bukti penanganan
                            </a>
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    );
}
