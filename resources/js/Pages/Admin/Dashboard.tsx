export default function Dashboard({ counts }: any) {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="mb-6 text-3xl font-bold">Dashboard Admin</h1>
            <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(counts ?? {}).map(([key, value]) => (
                    <div key={key} className="rounded bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">
                            {key.replaceAll("_", " ")}
                        </p>
                        <p className="text-3xl font-bold">{String(value)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
