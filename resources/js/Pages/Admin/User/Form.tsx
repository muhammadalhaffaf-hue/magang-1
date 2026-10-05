import { Form, Link } from "@inertiajs/react";
import { useState } from "react";
export default function FormPage({ user, opds, vendors }: any) {
    const edit = Boolean(user?.id);
    const [role, setRole] = useState(user?.role ?? "opd");
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
                    {({ errors, processing }) => (
                        <>
                            <input
                                name="nama"
                                placeholder="Nama"
                                defaultValue={user?.nama ?? ""}
                                required
                                className="rounded border p-2"
                            />
                            {errors.nama && (
                                <span className="text-sm text-red-600">
                                    {errors.nama}
                                </span>
                            )}
                            <input
                                name="email"
                                type="email"
                                placeholder="Email"
                                defaultValue={user?.email ?? ""}
                                required
                                className="rounded border p-2"
                            />
                            {errors.email && (
                                <span className="text-sm text-red-600">
                                    {errors.email}
                                </span>
                            )}
                            <input
                                name="password"
                                type="password"
                                placeholder={
                                    edit
                                        ? "Password baru (opsional)"
                                        : "Password"
                                }
                                required={!edit}
                                className="rounded border p-2"
                            />
                            {errors.password && (
                                <span className="text-sm text-red-600">
                                    {errors.password}
                                </span>
                            )}
                            <select
                                name="role"
                                value={role}
                                onChange={(event) =>
                                    setRole(event.target.value)
                                }
                                className="rounded border p-2"
                            >
                                <option value="admin">Admin</option>
                                <option value="opd">OPD</option>
                                <option value="pihak_ketiga">
                                    Pihak Ketiga
                                </option>
                            </select>
                            {role === "opd" ? (
                                <>
                                    <select
                                        name="opd_id"
                                        defaultValue={user?.opd_id ?? ""}
                                        required
                                        className="rounded border p-2"
                                    >
                                        <option value="">Pilih OPD</option>
                                        {opds.map((opd: any) => (
                                            <option key={opd.id} value={opd.id}>
                                                {opd.nama_opd}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.opd_id && (
                                        <span className="text-sm text-red-600">
                                            {errors.opd_id}
                                        </span>
                                    )}
                                </>
                            ) : null}
                            {role === "pihak_ketiga" ? (
                                <>
                                    <select
                                        name="pihak_ketiga_id"
                                        defaultValue={
                                            user?.pihak_ketiga_id ?? ""
                                        }
                                        required
                                        className="rounded border p-2"
                                    >
                                        <option value="">
                                            Pilih pihak ketiga
                                        </option>
                                        {vendors.map((vendor: any) => (
                                            <option
                                                key={vendor.id}
                                                value={vendor.id}
                                            >
                                                {vendor.nama_vendor}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.pihak_ketiga_id && (
                                        <span className="text-sm text-red-600">
                                            {errors.pihak_ketiga_id}
                                        </span>
                                    )}
                                </>
                            ) : null}
                            <select
                                name="status"
                                defaultValue={user?.status ?? "aktif"}
                                className="rounded border p-2"
                            >
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                            </select>
                            <button
                                disabled={processing}
                                className="rounded bg-blue-600 p-2 text-white disabled:opacity-50"
                            >
                                {processing ? "Menyimpan..." : "Simpan"}
                            </button>
                            <Link
                                href={route("users.index")}
                                className="text-center text-blue-600"
                            >
                                Kembali
                            </Link>
                        </>
                    )}
                </Form>
            </div>
        </div>
    );
}
