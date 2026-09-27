import { Link, router } from "@inertiajs/react";
export default function Index({ users }: any) {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-6xl rounded bg-white p-6 shadow">
                <div className="mb-4 flex justify-between">
                    <h1 className="text-2xl font-bold">Pengguna</h1>
                    <Link
                        href={route("users.create")}
                        className="rounded bg-blue-600 px-4 py-2 text-white"
                    >
                        Tambah
                    </Link>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="p-2">Nama</th>
                            <th className="p-2">Email</th>
                            <th className="p-2">Role</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.data.map((user: any) => (
                            <tr key={user.id} className="border-t">
                                <td className="p-2">{user.nama}</td>
                                <td className="p-2">{user.email}</td>
                                <td className="p-2">{user.role}</td>
                                <td className="p-2">{user.status}</td>
                                <td className="p-2">
                                    <Link
                                        href={route("users.edit", user.id)}
                                        className="mr-2 text-blue-600"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() =>
                                            router.delete(
                                                route("users.destroy", user.id),
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
