import { Link } from "@inertiajs/react";
export default function Show({ connection }: any) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">{connection.nama_isp}</h1>
            <p>OPD: {connection.opd?.nama_opd}</p>
            <p>Status: {connection.status}</p>
            <Link
                href={route("koneksi-internet.index")}
                className="text-blue-600"
            >
                Kembali
            </Link>
        </div>
    );
}
