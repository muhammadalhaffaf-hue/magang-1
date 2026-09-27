import { Link, router } from "@inertiajs/react";
export default function Index({ profilings, role }: any) {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-6xl rounded bg-white p-6 shadow">
                <div className="mb-4 flex justify-between">
                    <h1 className="text-2xl font-bold">Data Profiling</h1>
                    {role === "opd" ? (
                        <Link
                            href={route("profiling.create")}
                            className="rounded bg-blue-600 px-4 py-2 text-white"
                        >
                            Tambah Profiling
                        </Link>
                    ) : null}
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="p-2">OPD</th>
                            <th className="p-2">Periode</th>
                            <th className="p-2">Device</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profilings.data.map((item: any) => (
                            <tr key={item.id} className="border-t">
                                <td className="p-2">{item.opd?.nama_opd}</td>
                                <td className="p-2">{item.periode}</td>
                                <td className="p-2">{item.jumlah_device}</td>
                                <td className="p-2">
                                    {item.status_verifikasi}
                                </td>
                                <td className="p-2">
                                    {role === "opd" &&
                                    item.status_verifikasi !==
                                        "diverifikasi" ? (
                                        <>
                                            <Link
                                                href={route(
                                                    "profiling.edit",
                                                    item.id,
                                                )}
                                                className="mr-2 text-blue-600"
                                            >
                                                Edit
                                            </Link>
                                            {item.status_verifikasi ===
                                                "draft" ||
                                            item.status_verifikasi ===
                                                "dikembalikan" ? (
                                                <button
                                                    onClick={() =>
                                                        router.post(
                                                            route(
                                                                "profiling.submit",
                                                                item.id,
                                                            ),
                                                        )
                                                    }
                                                    className="text-green-600"
                                                >
                                                    Ajukan
                                                </button>
                                            ) : null}
                                        </>
                                    ) : null}
                                    {role === "admin" &&
                                    item.status_verifikasi === "diajukan" ? (
                                        <>
                                            <button
                                                onClick={() =>
                                                    router.post(
                                                        route(
                                                            "profiling.verify",
                                                            item.id,
                                                        ),
                                                    )
                                                }
                                                className="mr-2 text-green-600"
                                            >
                                                Verifikasi
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const catatan =
                                                        window.prompt(
                                                            "Catatan pengembalian:",
                                                        );
                                                    if (catatan)
                                                        router.post(
                                                            route(
                                                                "profiling.return",
                                                                item.id,
                                                            ),
                                                            { catatan },
                                                        );
                                                }}
                                                className="text-red-600"
                                            >
                                                Kembalikan
                                            </button>
                                        </>
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
