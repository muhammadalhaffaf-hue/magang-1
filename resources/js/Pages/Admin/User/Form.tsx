import { Form, Link } from "@inertiajs/react";
export default function FormPage({ user, opds, vendors }: any) {
    const edit = Boolean(user?.id);
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-xl rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-2xl font-bold">
                    {edit ? "Edit" : "Tambah"} Pengguna
                </h1>
                <Form
                    action={
                        edit
                            ? route("users.update", user.id)
                            : route("users.store")
                    }
                    method={edit ? "put" : "post"}
                    className="grid gap-3"
                >
                    <input
                        name="nama"
                        placeholder="Nama"
                        defaultValue={user?.nama ?? ""}
                        className="rounded border p-2"
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        defaultValue={user?.email ?? ""}
                        className="rounded border p-2"
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder={
                            edit ? "Password baru (opsional)" : "Password"
                        }
                        className="rounded border p-2"
                    />
                    <select
                        name="role"
                        defaultValue={user?.role ?? "opd"}
                        className="rounded border p-2"
                    >
                        <option value="admin">Admin</option>
                        <option value="opd">OPD</option>
                        <option value="pihak_ketiga">Pihak Ketiga</option>
                    </select>
                    <select
                        name="opd_id"
                        defaultValue={user?.opd_id ?? ""}
                        className="rounded border p-2"
                    >
                        <option value="">Pilih OPD</option>
                        {opds.map((opd: any) => (
                            <option key={opd.id} value={opd.id}>
                                {opd.nama_opd}
                            </option>
                        ))}
                    </select>
                    <select
                        name="pihak_ketiga_id"
                        defaultValue={user?.pihak_ketiga_id ?? ""}
                        className="rounded border p-2"
                    >
                        <option value="">Pilih pihak ketiga</option>
                        {vendors.map((vendor: any) => (
                            <option key={vendor.id} value={vendor.id}>
                                {vendor.nama_vendor}
                            </option>
                        ))}
                    </select>
                    <select
                        name="status"
                        defaultValue={user?.status ?? "aktif"}
                        className="rounded border p-2"
                    >
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                    </select>
                    <button className="rounded bg-blue-600 p-2 text-white">
                        Simpan
                    </button>
                    <Link
                        href={route("users.index")}
                        className="text-center text-blue-600"
                    >
                        Kembali
                    </Link>
                </Form>
            </div>
        </div>
    );
}
