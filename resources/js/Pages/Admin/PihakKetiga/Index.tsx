import { Link, router } from "@inertiajs/react";
export default function Index({ vendors }: any) {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-5xl rounded bg-white p-6 shadow">
                <div className="mb-4 flex justify-between">
                    <h1 className="text-2xl font-bold">Pihak Ketiga</h1>
                    <Link
                        href={route("pihak-ketiga.create")}
                        className="rounded bg-blue-600 px-4 py-2 text-white"
                    >
                        Tambah
                    </Link>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="p-2">Nama Vendor</th>
                            <th className="p-2">Layanan</th>
                            <th className="p-2">Kontak</th>
                            <th className="p-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendors.data.map((vendor: any) => (
                            <tr key={vendor.id} className="border-t">
                                <td className="p-2">{vendor.nama_vendor}</td>
                                <td className="p-2">{vendor.jenis_layanan}</td>
                                <td className="p-2">
                                    {vendor.nomor_kontak || "-"}
                                </td>
                                <td className="p-2">
                                    <Link
                                        href={route(
                                            "pihak-ketiga.edit",
                                            vendor.id,
                                        )}
                                        className="mr-2 text-blue-600"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() =>
                                            router.delete(
                                                route(
                                                    "pihak-ketiga.destroy",
                                                    vendor.id,
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
