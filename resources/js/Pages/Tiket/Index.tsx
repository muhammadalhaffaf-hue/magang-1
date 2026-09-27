import { Link, router } from "@inertiajs/react";
export default function Index({ tickets, vendors }: any) {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-6xl rounded bg-white p-6 shadow">
                <div className="mb-4 flex justify-between">
                    <h1 className="text-2xl font-bold">Tiket Pengaduan</h1>
                    <Link
                        href={route("tiket.create")}
                        className="rounded bg-blue-600 px-4 py-2 text-white"
                    >
                        Buat Tiket
                    </Link>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="p-2">Nomor</th>
                            <th className="p-2">OPD</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.data.map((ticket: any) => (
                            <tr key={ticket.id} className="border-t">
                                <td className="p-2">{ticket.nomor_tiket}</td>
                                <td className="p-2">
                                    {ticket.kendala?.profiling?.opd?.nama_opd}
                                </td>
                                <td className="p-2">{ticket.status}</td>
                                <td className="p-2">
                                    <Link
                                        href={route("tiket.show", ticket.id)}
                                        className="text-blue-600"
                                    >
                                        Detail
                                    </Link>
                                    {vendors?.length > 0 &&
                                    ticket.status === "baru" ? (
                                        <button
                                            onClick={() =>
                                                router.post(
                                                    route(
                                                        "tiket.forward",
                                                        ticket.id,
                                                    ),
                                                    {
                                                        pihak_ketiga_id:
                                                            vendors[0].id,
                                                    },
                                                )
                                            }
                                            className="ml-3 text-green-600"
                                        >
                                            Teruskan
                                        </button>
                                    ) : null}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
