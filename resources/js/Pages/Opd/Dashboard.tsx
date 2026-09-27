import { Link } from "@inertiajs/react";
export default function Dashboard({ counts }: any) {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="mb-6 text-3xl font-bold">Dashboard OPD</h1>
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded bg-white p-5 shadow">
                    Profiling: {counts?.profiling ?? 0}
                </div>
                <div className="rounded bg-white p-5 shadow">
                    Tiket: {counts?.tiket ?? 0}
                </div>
                <Link
                    href={route("profiling.create")}
                    className="rounded bg-blue-600 p-5 text-white"
                >
                    Isi Profiling
                </Link>
            </div>
        </div>
    );
}
