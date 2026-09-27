import { Link, router } from "@inertiajs/react";
export default function Index({ connections }: any) {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-5xl rounded bg-white p-6 shadow">
                <div className="mb-4 flex justify-between">
                    <h1 className="text-2xl font-bold">Koneksi Internet</h1>
                    <Link
                        href={route("koneksi-internet.create")}
                        className="rounded bg-blue-600 px-4 py-2 text-white"
                    >
                        Tambah
                    </Link>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="p-2">OPD</th>
                            <th className="p-2">ISP</th>
                            <th className="p-2">Bandwidth</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {connections.data.map((item: any) => (
                            <tr key={item.id} className="border-t">
                                <td className="p-2">{item.opd?.nama_opd}</td>
                                <td className="p-2">{item.nama_isp}</td>
                                <td className="p-2">
                                    {item.bandwidth_mbps} Mbps
                                </td>
                                <td className="p-2">{item.status}</td>
                                <td className="p-2">
                                    <Link
                                        href={route(
                                            "koneksi-internet.edit",
                                            item.id,
                                        )}
                                        className="mr-2 text-blue-600"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() =>
                                            router.delete(
                                                route(
                                                    "koneksi-internet.destroy",
                                                    item.id,
                                                ),
                                            )
                                        }
                                        className="text-red-600"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
