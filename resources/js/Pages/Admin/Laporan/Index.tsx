export default function Index({ summary }: any) {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-4xl rounded bg-white p-6 shadow">
                <h1 className="mb-6 text-2xl font-bold">Laporan Rekap</h1>
                <p>Total OPD: {summary?.total_opd ?? 0}</p>
                <h2 className="mt-5 font-bold">Status Profiling</h2>
                {Object.entries(summary?.profiling ?? {}).map(
                    ([key, value]) => (
                        <p key={key}>
                            {key}: {String(value)}
                        </p>
                    ),
                )}
                <h2 className="mt-5 font-bold">Status Tiket</h2>
                {Object.entries(summary?.tiket ?? {}).map(([key, value]) => (
                    <p key={key}>
                        {key}: {String(value)}
                    </p>
                ))}
            </div>
        </div>
    );
}
