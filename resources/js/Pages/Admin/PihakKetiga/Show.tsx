import { Link } from "@inertiajs/react";
export default function Show({ vendor }: any) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">{vendor.nama_vendor}</h1>
            <p>Layanan: {vendor.jenis_layanan}</p>
            <p>Pengguna: {vendor.users_count ?? 0}</p>
            <Link href={route("pihak-ketiga.index")} className="text-blue-600">
                Kembali
            </Link>
        </div>
    );
}
