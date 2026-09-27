import { Link } from "@inertiajs/react";
export default function Dashboard({ counts }: any) {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="mb-6 text-3xl font-bold">Dashboard Pihak Ketiga</h1>
            <div className="rounded bg-white p-5 shadow">
                Tiket aktif: {counts?.tiket ?? 0}
            </div>
            <Link
                href={route("tiket.index")}
                className="mt-4 inline-block text-blue-600"
            >
                Lihat tiket
            </Link>
        </div>
    );
}
