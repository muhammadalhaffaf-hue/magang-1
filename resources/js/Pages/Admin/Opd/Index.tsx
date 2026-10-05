import { useEffect, useState, type ReactNode } from "react";
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    BarChart3,
    Building2,
    CheckCircle2,
    ClipboardCheck,
    ClipboardList,
    Command,
    ChevronDown,
    CircleCheck,
    CircleHelp,
    CircleOff,
    Download,
    Eye,
    FileClock,
    FileDown,
    FileSpreadsheet,
    FilePenLine,
    FileText,
    FileUp,
    FolderClock,
    Gauge,
    HeartCrack,
    LayoutDashboard,
    LogOut,
    Network,
    MapPinned,
    Pencil,
    Pin,
    RotateCcw,
    SearchCheck,
    Save,
    Server,
    Settings2,
    ShieldCheck,
    Ticket,
    Trash2,
    Upload,
    Users,
    Wrench,
    XCircle,
} from "lucide-react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { GridBackground } from "../../../Components/GridBackground";
import axios from "axios";

declare const route: (
    name: string,
    params?: string | number | Record<string, string | number | undefined>,
) => string;

// ─── Types ─────────────────────────────────────────────────────────────────
type Role = "admin" | "opd" | "vendor";
type OpdDashboardRecord = {
    id: number;
    nama_opd: string;
    alamat?: string | null;
    jumlah_pegawai?: number;
    koneksi_internet?: Array<{
        nama_isp: string;
        bandwidth_mbps: string | number;
        status: string;
    }>;
    data_profiling?: Array<{
        periode: string;
        status_verifikasi: string;
    }>;
};
type ProfilingRecord = {
    id: number;
    opd_id?: number;
    periode: string;
    status_verifikasi: string;
    jumlah_device: number;
    created_at?: string;
    kesimpulan?: string | null;
    tanggal_diajukan?: string | null;
    tanggal_diverifikasi?: string | null;
    opd?: {
        nama_opd: string;
        koneksi_internet?: Array<{
            nama_isp: string;
            bandwidth_mbps: string | number;
            status: string;
        }>;
    } | null;
    aplikasi?: Array<{ nama_aplikasi: string }>;
    speed_test?: {
        kecepatan_unduh: string | number;
        kecepatan_unggah: string | number | null;
        ping_ms: string | number | null;
        hasil: string;
        tanggal_test?: string;
    } | null;
    kendala?: Array<{
        id: number;
        jenis_kendala: string;
        nama_kendala?: string | null;
        deskripsi?: string | null;
        tiket?: {
            id: number;
            nomor_tiket: string;
            status: string;
        } | null;
    }>;
};
type UserDashboardRecord = {
    id: number;
    nama: string;
    email: string;
    role: "admin" | "opd" | "pihak_ketiga";
    opd_id: number | null;
    pihak_ketiga_id: number | null;
    status: "aktif" | "nonaktif";
    opd?: { id: number; nama_opd: string } | null;
    pihak_ketiga?: { id: number; nama_vendor: string } | null;
};
type VendorDashboardRecord = {
    id: number;
    nama_vendor: string;
    jenis_layanan?: "isp" | "perangkat" | "lainnya";
    kontak_person?: string | null;
    nomor_kontak?: string | null;
};
type VendorTicketRecord = {
    id: number;
    nomor_tiket: string;
    status: string;
    urgensi: string;
    created_at?: string;
    pihak_ketiga_id: number | null;
    kendala?: {
        jenis_kendala: string;
        nama_kendala?: string | null;
        deskripsi?: string | null;
        profiling?: { opd?: { nama_opd: string } | null } | null;
    } | null;
    pihak_ketiga?: { nama_vendor: string } | null;
    riwayat?: Array<{
        id: number;
        tanggal: string;
        catatan: string;
        status_baru: string | null;
        bukti_file: string | null;
        user?: { nama: string } | null;
    }>;
};
const ticketStatusLabels: Record<string, string> = {
    baru: "Baru",
    diteruskan: "Diteruskan",
    proses: "Proses",
    menunggu_verifikasi: "Menunggu Verifikasi",
    selesai: "Selesai",
    ditolak: "Ditolak",
};
const profilingIssueLabels: Record<string, string> = {
    bandwidth_kurang: "Speed Lambat",
    device: "Perangkat Rusak",
    topologi: "Konfigurasi Salah",
    sosialisasi: "Gangguan ISP",
};
const getProfilingIssueLabel = (issue: {
    jenis_kendala: string;
    nama_kendala?: string | null;
}) =>
    issue.nama_kendala?.trim() ||
    profilingIssueLabels[issue.jenis_kendala] ||
    issue.jenis_kendala;
type Screen =
    | "login"
    | "dashboard-admin"
    | "master-opd"
    | "master-user"
    | "verifikasi-profiling"
    | "kelola-tiket"
    | "verifikasi-penanganan"
    | "laporan"
    | "dashboard-opd"
    | "form-profiling"
    | "riwayat-profiling"
    | "tiket-pengaduan"
    | "pantau-tiket"
    | "dashboard-vendor"
    | "tiket-masuk"
    | "update-penanganan";

// ─── Mock Data ──────────────────────────────────────────────────────────────
const networkData = [
    { opd: "Dikbud", baik: 80, sedang: 15, buruk: 5 },
    { opd: "Dinkes", baik: 65, sedang: 25, buruk: 10 },
    { opd: "PUPR", baik: 55, sedang: 30, buruk: 15 },
    { opd: "Dishub", baik: 90, sedang: 8, buruk: 2 },
    { opd: "Diskominfo", baik: 95, sedang: 4, buruk: 1 },
    { opd: "BKD", baik: 70, sedang: 20, buruk: 10 },
];
const ticketTrend = [
    { bulan: "Apr", baru: 12, proses: 8, selesai: 5 },
    { bulan: "Mei", baru: 18, proses: 14, selesai: 10 },
    { bulan: "Jun", baru: 9, proses: 11, selesai: 15 },
    { bulan: "Jul", baru: 22, proses: 16, selesai: 12 },
    { bulan: "Ags", baru: 15, proses: 18, selesai: 20 },
    { bulan: "Sep", baru: 11, proses: 9, selesai: 14 },
];
const kondisiPie = [
    { name: "Baik", value: 68, color: "#22c55e" },
    { name: "Sedang", value: 22, color: "#f59e0b" },
    { name: "Buruk", value: 10, color: "#ef4444" },
];
const reportRows = [
    {
        opd: "Dinas Pendidikan",
        bandwidth: "100 Mbps",
        kondisi: "Baik",
        dl: 87,
        ul: 34,
        tiket: 0,
        profiling: "Diverifikasi",
        year: 2026,
        month: 9,
        baik: 80,
        sedang: 15,
        buruk: 5,
    },
    {
        opd: "Dinas Kesehatan",
        bandwidth: "100 Mbps",
        kondisi: "Sedang",
        dl: 61,
        ul: 28,
        tiket: 1,
        profiling: "Diajukan",
        year: 2026,
        month: 9,
        baik: 65,
        sedang: 25,
        buruk: 10,
    },
    {
        opd: "Dinas PUPR",
        bandwidth: "50 Mbps",
        kondisi: "Buruk",
        dl: 12,
        ul: 5,
        tiket: 2,
        profiling: "Diverifikasi",
        year: 2026,
        month: 8,
        baik: 55,
        sedang: 30,
        buruk: 15,
    },
    {
        opd: "Dinas Perhubungan",
        bandwidth: "200 Mbps",
        kondisi: "Baik",
        dl: 178,
        ul: 89,
        tiket: 0,
        profiling: "Diverifikasi",
        year: 2026,
        month: 7,
        baik: 90,
        sedang: 8,
        buruk: 2,
    },
    {
        opd: "BKD",
        bandwidth: "50 Mbps",
        kondisi: "Sedang",
        dl: 38,
        ul: 19,
        tiket: 1,
        profiling: "Diajukan",
        year: 2026,
        month: 9,
        baik: 70,
        sedang: 20,
        buruk: 10,
    },
];

const opdList = [
    {
        id: 1,
        nama: "Dinas Pendidikan dan Kebudayaan",
        alamat: "Jl. Ahmad Yani No. 12",
        pegawai: 245,
        koneksi: 3,
        profiling: "Diverifikasi",
    },
    {
        id: 2,
        nama: "Dinas Kesehatan",
        alamat: "Jl. Sudirman No. 45",
        pegawai: 189,
        koneksi: 5,
        profiling: "Diajukan",
    },
    {
        id: 3,
        nama: "Dinas PUPR",
        alamat: "Jl. Gatot Subroto No. 8",
        pegawai: 132,
        koneksi: 2,
        profiling: "Draft",
    },
    {
        id: 4,
        nama: "Dinas Perhubungan",
        alamat: "Jl. Diponegoro No. 22",
        pegawai: 98,
        koneksi: 4,
        profiling: "Diverifikasi",
    },
    {
        id: 5,
        nama: "Badan Kepegawaian Daerah",
        alamat: "Jl. Imam Bonjol No. 7",
        pegawai: 76,
        koneksi: 2,
        profiling: "Diajukan",
    },
    {
        id: 6,
        nama: "Dinas Sosial",
        alamat: "Jl. Veteran No. 33",
        pegawai: 88,
        koneksi: 1,
        profiling: "Belum",
    },
];
const userList = [
    {
        id: 1,
        nama: "Budi Santoso",
        email: "budi@diskominfo.go.id",
        role: "Admin",
        relasi: "Diskominfo",
        status: "Aktif",
    },
    {
        id: 2,
        nama: "Siti Rahayu",
        email: "siti@dikbud.go.id",
        role: "OPD",
        relasi: "Dinas Pendidikan",
        status: "Aktif",
    },
    {
        id: 3,
        nama: "Ahmad Fauzi",
        email: "ahmad@dinkesehatan.go.id",
        role: "OPD",
        relasi: "Dinas Kesehatan",
        status: "Aktif",
    },
    {
        id: 4,
        nama: "CV Jaringan Sejahtera",
        email: "admin@jarsehjahtera.com",
        role: "Vendor",
        relasi: "CV Jaringan Sejahtera",
        status: "Aktif",
    },
    {
        id: 5,
        nama: "PT Koneksi Andal",
        email: "ops@koneksiandal.id",
        role: "Vendor",
        relasi: "PT Koneksi Andal",
        status: "Nonaktif",
    },
];
const profilingQueue = [
    {
        id: 1,
        opd: "Dinas Kesehatan",
        diajukan: "2026-09-15",
        bandwidth: "100 Mbps",
        device: 42,
        status: "Diajukan",
        dl: 61,
        ul: 28,
        ping: 22,
        isp: "PT Firstmedia",
        kondisi: "Sedang",
        apps: ["SIMRS", "SIMPEG", "e-Puskesmas"],
        kendala: ["Speed Lambat", "Koneksi Putus"],
        catatan: "Internet sering putus antara pukul 08–10 pagi.",
    },
    {
        id: 2,
        opd: "Badan Kepegawaian Daerah",
        diajukan: "2026-08-12",
        bandwidth: "50 Mbps",
        device: 28,
        status: "Diajukan",
        dl: 38,
        ul: 19,
        ping: 45,
        isp: "PT Telkom",
        kondisi: "Sedang",
        apps: ["SIMPEG", "SAPK"],
        kendala: ["Konfigurasi Jaringan"],
        catatan: "VLAN tidak terkonfigurasi setelah penambahan ruangan.",
    },
];
type ProfilingQueueItem = Omit<(typeof profilingQueue)[number], "ping"> & {
    ping: number | null;
};

function toProfilingQueueItem(profiling: ProfilingRecord): ProfilingQueueItem {
    const connection = profiling.opd?.koneksi_internet?.find(
        (item) => item.status === "aktif",
    );
    const speedTest = profiling.speed_test;
    return {
        id: profiling.id,
        opd: profiling.opd?.nama_opd ?? "OPD",
        diajukan: (profiling.tanggal_diajukan ?? `${profiling.periode}-01`).slice(
            0,
            10,
        ),
        bandwidth: `${connection?.bandwidth_mbps ?? 0} Mbps`,
        device: profiling.jumlah_device,
        status: "Diajukan",
        dl: Number(speedTest?.kecepatan_unduh ?? 0),
        ul: Number(speedTest?.kecepatan_unggah ?? 0),
        ping:
            speedTest?.ping_ms == null
                ? null
                : Number(speedTest.ping_ms),
        isp: connection?.nama_isp ?? "-",
        kondisi: speedTest?.hasil === "sesuai" ? "Baik" : "Sedang",
        apps: (profiling.aplikasi ?? []).map((app) => app.nama_aplikasi),
        kendala: (profiling.kendala ?? []).map(getProfilingIssueLabel),
        catatan:
            profiling.kesimpulan ??
            profiling.kendala?.map((item) => item.deskripsi).filter(Boolean).join("; ") ??
            "-",
    };
}
const ticketList = [
    {
        id: "TKT-001",
        opd: "Dinas PUPR",
        kendala: "Koneksi Putus",
        deskripsi:
            "Internet tidak bisa terhubung sejak pagi hari. Sudah dicoba restart router namun tidak berhasil.",
        status: "Baru",
        tanggal: "2026-09-17",
        vendor: null as string | null,
        prioritas: "Tinggi",
        histori: [
            {
                tgl: "2026-09-17",
                ev: "Tiket dibuat oleh OPD",
                aktor: "Dinas PUPR",
            },
        ],
    },
    {
        id: "TKT-002",
        opd: "Dinas Sosial",
        kendala: "Speed Lambat",
        deskripsi:
            "Kecepatan download hanya 2 Mbps padahal berlangganan 50 Mbps. Terjadi sejak 3 hari lalu.",
        status: "Proses",
        tanggal: "2026-09-14",
        vendor: "CV Jaringan Sejahtera" as string | null,
        prioritas: "Sedang",
        histori: [
            { tgl: "2026-09-14", ev: "Tiket dibuat", aktor: "Dinas Sosial" },
            {
                tgl: "2026-09-15",
                ev: "Diteruskan ke CV Jaringan Sejahtera",
                aktor: "Admin",
            },
            {
                tgl: "2026-09-15",
                ev: "Tiket diterima, penanganan dimulai",
                aktor: "CV Jaringan Sejahtera",
            },
        ],
    },
    {
        id: "TKT-003",
        opd: "Dinas Pendidikan",
        kendala: "Perangkat Rusak",
        deskripsi:
            "Switch utama tidak merespons setelah pemadaman listrik. Seluruh ruangan terdampak.",
        status: "Selesai",
        tanggal: "2026-09-10",
        vendor: "PT Koneksi Andal" as string | null,
        prioritas: "Tinggi",
        histori: [
            {
                tgl: "2026-09-10",
                ev: "Tiket dibuat",
                aktor: "Dinas Pendidikan",
            },
            {
                tgl: "2026-09-11",
                ev: "Diteruskan ke PT Koneksi Andal",
                aktor: "Admin",
            },
            {
                tgl: "2026-09-12",
                ev: "Penanganan selesai, bukti diunggah",
                aktor: "PT Koneksi Andal",
            },
        ],
    },
    {
        id: "TKT-004",
        opd: "BKD",
        kendala: "Konfigurasi Jaringan",
        deskripsi:
            "VLAN tidak terkonfigurasi dengan benar setelah penambahan ruangan baru di lantai 3.",
        status: "Diteruskan",
        tanggal: "2026-09-16",
        vendor: "CV Jaringan Sejahtera" as string | null,
        prioritas: "Rendah",
        histori: [
            { tgl: "2026-09-16", ev: "Tiket dibuat", aktor: "BKD" },
            {
                tgl: "2026-09-17",
                ev: "Diteruskan ke CV Jaringan Sejahtera",
                aktor: "Admin",
            },
        ],
    },
];
const riwayatProfiling = [
    {
        periode: "Sep 2026",
        status: "Diverifikasi",
        kondisi: "Baik",
        dl: 87,
        ul: 34,
        ping: 12,
        bandwidth: "100 Mbps",
        device: 52,
        isp: "PT Telkom Indonesia",
        apps: ["SIMDA", "SIPD", "e-Office"],
        kendala: "Tidak ada",
        catatan:
            "Kondisi jaringan sangat baik. Kecepatan mendekati bandwidth berlangganan. Rekomendasi: pertahankan dan lakukan pemantauan berkala.",
        verifikator: "Budi Santoso",
        tglVerifikasi: "2026-09-18",
    },
    {
        periode: "Ags 2026",
        status: "Diverifikasi",
        kondisi: "Sedang",
        dl: 54,
        ul: 22,
        ping: 28,
        bandwidth: "100 Mbps",
        device: 50,
        isp: "PT Telkom Indonesia",
        apps: ["SIMDA", "SIPD", "e-Office"],
        kendala: "Speed Lambat",
        catatan:
            "Kecepatan di bawah 60% bandwidth berlangganan. Kemungkinan pembebanan trafik pada jam sibuk. Disarankan upgrade paket atau koordinasi dengan ISP.",
        verifikator: "Budi Santoso",
        tglVerifikasi: "2026-08-20",
    },
    {
        periode: "Jul 2026",
        status: "Diverifikasi",
        kondisi: "Baik",
        dl: 91,
        ul: 45,
        ping: 9,
        bandwidth: "100 Mbps",
        device: 49,
        isp: "PT Telkom Indonesia",
        apps: ["SIMDA", "SIPD"],
        kendala: "Tidak ada",
        catatan:
            "Performa optimal. Tidak ada kendala berarti. Tambahan perangkat bulan ini berjalan lancar.",
        verifikator: "Budi Santoso",
        tglVerifikasi: "2026-07-22",
    },
    {
        periode: "Jun 2026",
        status: "Ditolak",
        kondisi: "-",
        dl: 0,
        ul: 0,
        ping: 0,
        bandwidth: "100 Mbps",
        device: 48,
        isp: "PT Telkom Indonesia",
        apps: ["SIMDA"],
        kendala: "Data tidak lengkap",
        catatan:
            "Hasil speed test tidak disertakan. Mohon isi ulang dengan data yang lengkap.",
        verifikator: "Budi Santoso",
        tglVerifikasi: "2026-06-18",
    },
];

// ─── Primitives ─────────────────────────────────────────────────────────────
const clx = (...args: (string | false | undefined)[]) =>
    args.filter(Boolean).join(" ");

const Badge = ({ label, color }: { label: string; color: string }) => {
    const c: Record<string, string> = {
        green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        yellow: "bg-amber-100 text-amber-700 border border-amber-200",
        red: "bg-red-50 text-red-700 border border-red-200",
        blue: "bg-blue-100 text-blue-700 border border-blue-200",
        gray: "bg-slate-100 text-slate-500 border border-slate-200",
        purple: "bg-purple-100 text-purple-700 border border-purple-200",
        teal: "bg-teal-100 text-teal-700 border border-teal-200",
        sky: "bg-sky-100 text-sky-700 border border-sky-200",
    };
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c[color] ?? c.gray}`}
        >
            {label}
        </span>
    );
};

const statusBadge = (s: string) => {
    const m: Record<string, string> = {
        Diverifikasi: "green",
        Diajukan: "blue",
        Dikembalikan: "red",
        Draft: "gray",
        Belum: "gray",
        Baru: "sky",
        Proses: "yellow",
        Diteruskan: "purple",
        Selesai: "green",
        Ditutup: "teal",
        Ditolak: "red",
        Aktif: "green",
        Nonaktif: "red",
        Baik: "green",
        Sedang: "yellow",
        Buruk: "red",
    };
    return <Badge label={s} color={m[s] ?? "gray"} />;
};

const Dot = ({
    color,
}: {
    color: "green" | "yellow" | "red" | "blue" | "gray";
}) => {
    const c = {
        green: "bg-green-500",
        yellow: "bg-amber-400",
        red: "bg-red-500",
        blue: "bg-blue-500",
        gray: "bg-slate-400",
    };
    return <span className={`inline-block w-2 h-2 rounded-full ${c[color]}`} />;
};

const Card = ({
    children,
    className = "",
    onClick,
}: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}) => (
    <div
        onClick={onClick}
        className={`card-soft-shadow bg-white rounded-2xl border border-slate-100 shadow-sm ${
            onClick
                ? "cursor-pointer hover:border-blue-200 hover:shadow-md transition-all"
                : ""
        } ${className}`}
    >
        {children}
    </div>
);

const StatCard = ({
    label,
    value,
    sub,
    icon,
    color = "blue",
    trend,
}: {
    label: string;
    value: string | number;
    sub?: string;
    icon: ReactNode;
    color?: string;
    trend?: string;
}) => {
    const bg: Record<string, string> = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        amber: "bg-amber-50 text-amber-600",
        red: "bg-red-50 text-red-600",
        purple: "bg-purple-50 text-purple-600",
    };
    return (
        <Card className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
                <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl flex-shrink-0 ${bg[color] ?? bg.blue}`}
                >
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide truncate">
                        {label}
                    </p>
                    <p className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-0.5">
                        {value}
                    </p>
                    {sub && (
                        <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                    )}
                    {trend && (
                        <p className="text-xs text-green-600 font-medium mt-1">
                            {trend}
                        </p>
                    )}
                </div>
            </div>
        </Card>
    );
};

const PageHeader = ({
    title,
    sub,
    action,
}: {
    title: string;
    sub?: string;
    action?: React.ReactNode;
}) => (
    <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
                {title}
            </h1>
            {sub && <p className="text-sm text-slate-400 mt-0.5">{sub}</p>}
        </div>
        {action && <div className="flex gap-2 flex-wrap">{action}</div>}
    </div>
);

const Btn = ({
    children,
    variant = "primary",
    type = "button",
    onClick,
    disabled,
    small,
    full,
    className = "",
}: {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
    type?: "button" | "submit";
    onClick?: () => void;
    disabled?: boolean;
    small?: boolean;
    full?: boolean;
    className?: string;
}) => {
    const base = `inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none ${
        small ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2.5"
    } ${full ? "w-full" : ""}`;
    const v = {
        primary:
            "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm",
        secondary:
            "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400",
        ghost: "bg-transparent text-slate-500 hover:bg-slate-100 focus:ring-slate-300",
        danger: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-300",
        success:
            "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus:ring-emerald-300",
    };
    return (
        <button
            type={type}
            className={`${base} ${v[variant]} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

const FInput = ({
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    error,
    required,
    hint,
    min,
    max,
    readOnly = false,
    className = "",
}: {
    label?: string;
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (v: string) => void;
    error?: string;
    required?: boolean;
    hint?: string;
    min?: string;
    max?: string;
    readOnly?: boolean;
    className?: string;
}) => (
    <div className="relative">
        {label && (
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
        )}
        {hint && <p className="text-xs text-slate-400 mb-1.5">{hint}</p>}
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            min={min}
            max={max}
            readOnly={readOnly}
            onChange={(e) => onChange?.(e.target.value)}
            className={clx(
                "w-full px-4 py-2.5 text-sm rounded-xl border bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all",
                error
                    ? "border-red-400 bg-red-50"
                    : "border-slate-200 hover:border-slate-300",
                readOnly && "bg-slate-50 cursor-not-allowed",
                className,
            )}
        />
        {error && <p className="text-xs text-red-500 mt-1">⚠ {error}</p>}
    </div>
);

const FTextarea = ({
    label,
    placeholder,
    rows = 3,
    value,
    onChange,
    hint,
    required,
}: {
    label?: string;
    placeholder?: string;
    rows?: number;
    value?: string;
    onChange?: (v: string) => void;
    hint?: string;
    required?: boolean;
}) => (
    <div>
        {label && (
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
        )}
        {hint && <p className="text-xs text-slate-400 mb-1.5">{hint}</p>}
        <textarea
            rows={rows}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
        />
    </div>
);

const FSelect = ({
    label,
    options,
    value,
    onChange,
    hint,
    placeholder,
}: {
    label?: string;
    options: string[];
    value?: string;
    onChange?: (v: string) => void;
    hint?: string;
    placeholder?: string;
}) => (
    <div className="relative">
        {label && (
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                {label}
            </label>
        )}
        {hint && <p className="text-xs text-slate-400 mb-1.5">{hint}</p>}
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                style={{
                    appearance: "none",
                    WebkitAppearance: "none",
                    backgroundImage: "none",
                }}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-800 transition-all hover:border-blue-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {placeholder && (
                    <option value="">{placeholder}</option>
                )}
                {options.map((o) => (
                    <option key={o}>{o}</option>
                ))}
            </select>
            <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
        </div>
    </div>
);

const SearchBar = ({
    value,
    onChange,
    placeholder = "Cari...",
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) => (
    <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
            <SearchCheck size={16} />
        </span>
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
    </div>
);

const Modal = ({
    title,
    children,
    onClose,
    wide,
}: {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
    wide?: boolean;
}) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
        <div
            className={`bg-white w-full sm:rounded-2xl shadow-2xl overflow-hidden ${
                wide ? "sm:max-w-2xl" : "sm:max-w-md"
            } max-h-[90vh] flex flex-col rounded-t-2xl`}
        >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
                <h2 className="text-base font-bold text-slate-800">{title}</h2>
                <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer transition-all"
                >
                    <XCircle size={16} />
                </button>
            </div>
            <div className="overflow-y-auto flex-1">{children}</div>
        </div>
    </div>
);

const ConfirmModal = ({
    title,
    message,
    onConfirm,
    onCancel,
    danger,
}: {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    danger?: boolean;
}) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-sm p-6 text-center">
            <div className="mb-3 flex justify-center text-amber-500">
                {danger ? (
                    <AlertTriangle size={36} />
                ) : (
                    <ClipboardCheck size={36} />
                )}
            </div>
            <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 mb-6">{message}</p>
            <div className="flex gap-3 justify-center">
                <Btn
                    variant={danger ? "danger" : "primary"}
                    onClick={onConfirm}
                >
                    {danger ? "Ya, Hapus" : "Konfirmasi"}
                </Btn>
                <Btn variant="secondary" onClick={onCancel}>
                    Batal
                </Btn>
            </div>
        </Card>
    </div>
);

const InfoBox = ({
    children,
    type = "info",
}: {
    children: React.ReactNode;
    type?: "info" | "warn" | "success" | "error";
}) => {
    const t = {
        info: "bg-blue-50 border-blue-200 text-blue-700",
        warn: "bg-amber-50 border-amber-200 text-amber-700",
        success: "bg-green-50 border-green-200 text-green-700",
        error: "bg-red-50 border-red-200 text-red-700",
    };
    return (
        <div className={`rounded-xl border px-4 py-3 text-sm ${t[type]}`}>
            {children}
        </div>
    );
};

const TimelineItem = ({
    date,
    event,
    actor,
    last,
    color = "blue",
}: {
    date: string;
    event: string;
    actor: string;
    last?: boolean;
    color?: "blue" | "green" | "yellow";
}) => {
    const dotC = {
        blue: "bg-blue-500",
        green: "bg-green-500",
        yellow: "bg-amber-400",
    };
    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center">
                <div
                    className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${dotC[color]}`}
                />
                {!last && (
                    <div className="w-px flex-1 bg-slate-200 mt-1 mb-1" />
                )}
            </div>
            <div className={last ? "" : "pb-4"}>
                <p className="text-sm font-semibold text-slate-800">{event}</p>
                <p className="text-xs text-slate-400">
                    {date} · {actor}
                </p>
            </div>
        </div>
    );
};

// ─── Navigation Config ───────────────────────────────────────────────────────
const navItems: Record<
    Role,
    {
        icon: ReactNode;
        label: string;
        screen: Screen;
        desc: string;
    }[]
> = {
    admin: [
        {
            icon: <LayoutDashboard size={18} />,
            label: "Dashboard",
            screen: "dashboard-admin",
            desc: "Ringkasan sistem",
        },
        {
            icon: <Building2 size={18} />,
            label: "Data OPD",
            screen: "master-opd",
            desc: "Kelola OPD",
        },
        {
            icon: <Users size={18} />,
            label: "Data User",
            screen: "master-user",
            desc: "Kelola akun",
        },
        {
            icon: <ClipboardCheck size={18} />,
            label: "Verifikasi Profiling",
            screen: "verifikasi-profiling",
            desc: "Tinjau profiling",
        },
        {
            icon: <Ticket size={18} />,
            label: "Kelola Tiket",
            screen: "kelola-tiket",
            desc: "Distribusi tiket",
        },
        {
            icon: <SearchCheck size={18} />,
            label: "Verifikasi Penanganan",
            screen: "verifikasi-penanganan",
            desc: "Tutup tiket selesai",
        },
        {
            icon: <BarChart3 size={18} />,
            label: "Laporan",
            screen: "laporan",
            desc: "Ekspor & rekap",
        },
    ],
    opd: [
        {
            icon: <LayoutDashboard size={18} />,
            label: "Dashboard",
            screen: "dashboard-opd",
            desc: "Status OPD saya",
        },
        {
            icon: <FilePenLine size={18} />,
            label: "Isi Profiling",
            screen: "form-profiling",
            desc: "Lapor kondisi jaringan",
        },
        {
            icon: <FolderClock size={18} />,
            label: "Riwayat Profiling",
            screen: "riwayat-profiling",
            desc: "Arsip profiling lalu",
        },
        {
            icon: <Ticket size={18} />,
            label: "Ajukan Tiket",
            screen: "tiket-pengaduan",
            desc: "Lapor kendala",
        },
        {
            icon: <SearchCheck size={18} />,
            label: "Pantau Tiket",
            screen: "pantau-tiket",
            desc: "Status pengaduan",
        },
    ],
    vendor: [
        {
            icon: <LayoutDashboard size={18} />,
            label: "Dashboard",
            screen: "dashboard-vendor",
            desc: "Ikhtisar penugasan",
        },
        {
            icon: <ClipboardList size={18} />,
            label: "Tiket Masuk",
            screen: "tiket-masuk",
            desc: "Terima/tolak tiket",
        },
        {
            icon: <Upload size={18} />,
            label: "Update Penanganan",
            screen: "update-penanganan",
            desc: "Progress & bukti",
        },
    ],
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({
    role,
    current,
    onNav,
    onLogout,
    userName,
}: {
    role: Role;
    current: Screen;
    onNav: (s: Screen) => void;
    onLogout: () => void;
    userName: string;
}) {
    const items = navItems[role];
    const roleLabel = {
        admin: "Administrator",
        opd: "Operator OPD",
        vendor: "Pihak Ketiga",
    }[role];
    return (
        <aside className="nav-panel-shadow hidden lg:flex w-64 xl:w-72 flex-shrink-0 flex-col bg-blue-50/70 border-r border-blue-100 h-screen sticky top-0 self-start overflow-hidden">
            <div className="px-5 py-5 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-700 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg">
                        DK
                    </div>
                    <div>
                        <p className="text-slate-900 font-bold text-sm leading-tight">
                            SIPROJAR
                        </p>
                        <p className="text-slate-500 text-xs">Diskominfo</p>
                    </div>
                </div>
            </div>
            <div className="px-5 pt-4 pb-2">
                <p className="text-indigo-500 text-[10px] font-bold uppercase tracking-widest">
                    {roleLabel}
                </p>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-3">
                {items.map((item) => {
                    const active = current === item.screen;
                    return (
                        <button
                            key={item.screen}
                            onClick={() => onNav(item.screen)}
                            className={clx(
                                "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left cursor-pointer group",
                                active
                                    ? "bg-blue-50 text-blue-800 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-blue-600"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                            )}
                        >
                            <span
                                className={clx(
                                    "w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 transition-all",
                                    active
                                        ? "bg-blue-700 text-white"
                                        : "text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-700",
                                )}
                            >
                                {item.icon}
                            </span>
                            <div className="min-w-0">
                                <p
                                    className={`font-semibold text-sm leading-tight ${
                                        active ? "text-blue-800" : ""
                                    }`}
                                >
                                    {item.label}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">
                                    {item.desc}
                                </p>
                            </div>
                            {active && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                            )}
                        </button>
                    );
                })}
            </nav>
            <div className="px-4 py-4 border-t border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                        {userName[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-slate-800 text-sm font-semibold truncate">
                            {userName}
                        </p>
                        <p className="text-slate-500 text-xs">{roleLabel}</p>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="mt-3 w-full text-xs text-slate-500 hover:text-blue-700 hover:bg-blue-50 py-2 rounded-xl transition-all cursor-pointer"
                >
                    <LogOut size={14} className="mr-2 inline" />
                    Keluar dari Sistem
                </button>
            </div>
        </aside>
    );
}

function BottomNav({
    role,
    current,
    onNav,
}: {
    role: Role;
    current: Screen;
    onNav: (s: Screen) => void;
}) {
    const items = navItems[role].slice(0, 5);
    return (
        <nav className="nav-panel-shadow lg:hidden fixed bottom-0 left-0 right-0 bg-blue-50/90 border-t border-blue-100 z-40 flex safe-area-pb">
            {items.map((item) => {
                const active = current === item.screen;
                return (
                    <button
                        key={item.screen}
                        onClick={() => onNav(item.screen)}
                        className={clx(
                            "flex-1 flex flex-col items-center gap-0.5 py-2.5 px-1 transition-all cursor-pointer",
                            active
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-slate-400 border-b-2 border-transparent",
                        )}
                    >
                        <span
                            className={clx(
                                "text-lg w-8 h-8 flex items-center justify-center rounded-lg transition-all",
                                active ? "bg-blue-100" : "",
                            )}
                        >
                            {item.icon}
                        </span>
                        <span className="text-[9px] font-semibold leading-tight text-center">
                            {item.label.split(" ")[0]}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}

function TopBar({ title, onLogout }: { title: string; onLogout: () => void }) {
    return (
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center text-white font-black text-xs">
                    DK
                </div>
                <p className="text-slate-900 font-bold text-sm truncate">
                    {title}
                </p>
            </div>
            <button
                onClick={onLogout}
                className="text-slate-500 text-xs cursor-pointer hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-all"
            >
                <LogOut size={14} className="mr-1 inline" />
                Keluar
            </button>
        </div>
    );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function createCaptcha() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    const colors = ["#047857", "#166534", "#065f46", "#0f766e", "#14532d", "#475569"];
    const backgrounds = ["#ecfdf5", "#f0fdf4", "#eff6ff", "#f0fdfa", "#f8fafc"];
    const code = Array.from(
        { length: 5 },
        () => alphabet[Math.floor(Math.random() * alphabet.length)],
    ).join("");

    return {
        code,
        background: backgrounds[Math.floor(Math.random() * backgrounds.length)],
        characters: Array.from(code, (character, index) => ({
            character,
            x: 14 + index * 27 + Math.floor(Math.random() * 5) - 2,
            y: 29 + Math.floor(Math.random() * 9) - 4,
            rotation: Math.floor(Math.random() * 37) - 18,
            skew: Math.floor(Math.random() * 15) - 7,
            fontSize: 17 + Math.floor(Math.random() * 5),
            fontFamily: ["monospace", "serif", "sans-serif"][Math.floor(Math.random() * 3)],
            color: colors[Math.floor(Math.random() * colors.length)],
        })),
        lines: Array.from({ length: 12 }, () => ({
            x1: Math.floor(Math.random() * 160),
            y1: Math.floor(Math.random() * 44),
            x2: Math.floor(Math.random() * 160),
            y2: Math.floor(Math.random() * 44),
            stroke: colors[Math.floor(Math.random() * colors.length)],
            strokeWidth: Math.random() * 1.4 + 0.6,
            opacity: Math.random() * 0.3 + 0.2,
        })),
        dots: Array.from({ length: 32 }, () => ({
            cx: Math.floor(Math.random() * 160),
            cy: Math.floor(Math.random() * 44),
            r: Math.random() * 1.6 + 0.3,
            fill: colors[Math.floor(Math.random() * colors.length)],
            opacity: Math.random() * 0.4 + 0.2,
        })),
    };
}

function Login() {
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const [captcha, setCaptcha] = useState(createCaptcha);
    const [captchaAnswer, setCaptchaAnswer] = useState("");
    const submit = async () => {
        setErr("");
        if (captchaAnswer.trim() !== captcha.code) {
            setErr("Jawaban CAPTCHA belum benar. Silakan coba lagi.");
            setCaptcha(createCaptcha());
            setCaptchaAnswer("");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post<{
                role: "admin" | "opd" | "pihak_ketiga";
                name: string;
                dashboard_url: string;
            }>(
                route("login"),
                { email, password: pw },
                { headers: { Accept: "application/json" } },
            );
            window.location.assign(response.data.dashboard_url);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errors = error.response?.data?.errors;
                setErr(
                    errors?.email?.[0] ??
                        error.response?.data?.message ??
                        "Tidak dapat terhubung ke server. Silakan coba lagi.",
                );
            } else {
                setErr("Terjadi kesalahan saat masuk. Silakan coba lagi.");
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="relative min-h-screen bg-transparent flex flex-col lg:flex-row">
            <div className="hidden lg:flex flex-col justify-between w-1/2 p-16">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-blue-500 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">
                        DK
                    </div>
                    <div>
                        <p className="text-slate-900 font-bold text-lg">
                            SIPROJAR
                        </p>
                        <p className="text-slate-500 text-sm">
                            Diskominfo Kab/Kota
                        </p>
                    </div>
                </div>
                <div>
                    <h2 className="text-4xl xl:text-5xl font-extrabold text-slate-900 leading-tight mb-5">
                        Monitoring Jaringan
                        <br />
                        <span className="text-blue-700">Terpadu</span>
                    </h2>
                    <p className="text-slate-600 text-lg leading-relaxed max-w-md">
                        Platform resmi Diskominfo untuk pemantauan kondisi
                        infrastruktur jaringan seluruh OPD, manajemen pengaduan,
                        dan koordinasi penanganan teknis.
                    </p>
                    <div className="mt-10 grid grid-cols-3 gap-4">
                        {[
                            ["32", "OPD Terdaftar"],
                            ["98%", "Uptime Rata-rata"],
                            ["1.2rb", "Tiket Terselesaikan"],
                        ].map(([v, l]) => (
                            <div
                                key={l}
                                className="bg-white/80 backdrop-blur border border-slate-200 rounded-2xl p-4 shadow-sm"
                            >
                                <p className="text-2xl font-extrabold text-slate-900">
                                    {v}
                                </p>
                                <p className="text-slate-500 text-xs mt-1">
                                    {l}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
                <p className="text-slate-500 text-sm">
                    © 2026 Dinas Komunikasi dan Informatika
                </p>
            </div>
            <div className="flex-1 flex items-center justify-center p-5 sm:p-8">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-3xl shadow-2xl p-7 sm:p-9">
                        <div className="flex items-center gap-3 mb-8 lg:hidden">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black">
                                DK
                            </div>
                            <div>
                                <p className="font-bold text-slate-800">
                                    SIPROJAR
                                </p>
                                <p className="text-slate-400 text-xs">
                                    Diskominfo
                                </p>
                            </div>
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-800 mb-1">
                            Selamat Datang
                        </h1>
                        <p className="text-slate-400 text-sm mb-7">
                            Masuk untuk mengakses dashboard Anda
                        </p>
                        <div className="space-y-4">
                            <FInput
                                label="Alamat Email"
                                type="email"
                                placeholder="nama@instansi.go.id"
                                value={email}
                                onChange={setEmail}
                                required
                                className="login-input"
                            />
                            <FInput
                                label="Kata Sandi"
                                type="password"
                                placeholder="Masukkan kata sandi"
                                value={pw}
                                onChange={setPw}
                                required
                                className="login-input"
                            />
                        </div>
                        <div className="mt-5">
                            <label
                                htmlFor="captcha-answer"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Verifikasi keamanan
                            </label>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <svg
                                    viewBox="0 0 160 44"
                                    role="img"
                                    aria-label="Gambar kode CAPTCHA acak"
                                    className="h-11 w-28 shrink-0 rounded-lg border border-slate-200 sm:w-32"
                                >
                                    <rect
                                        width="160"
                                        height="44"
                                        rx="8"
                                        fill={captcha.background}
                                    />
                                    {captcha.lines.slice(0, 7).map((line, index) => (
                                        <line
                                            key={`back-line-${index}`}
                                            {...line}
                                            strokeLinecap="round"
                                        />
                                    ))}
                                    {captcha.dots.map((dot, index) => (
                                        <circle
                                            key={`dot-${index}`}
                                            {...dot}
                                        />
                                    ))}
                                    {captcha.characters.map((item, index) => (
                                        <text
                                            key={`character-${index}`}
                                            x={item.x}
                                            y={item.y}
                                            transform={`rotate(${item.rotation} ${item.x} 24) skewX(${item.skew})`}
                                            fill={item.color}
                                            fontFamily={item.fontFamily}
                                            fontSize={item.fontSize}
                                            fontWeight="700"
                                        >
                                            {item.character}
                                        </text>
                                    ))}
                                    {captcha.lines.slice(7).map((line, index) => (
                                        <line
                                            key={`front-line-${index}`}
                                            {...line}
                                            strokeLinecap="round"
                                        />
                                    ))}
                                </svg>
                                <input
                                    id="captcha-answer"
                                    type="text"
                                    inputMode="text"
                                    autoCapitalize="off"
                                    autoComplete="off"
                                    spellCheck={false}
                                    value={captchaAnswer}
                                    onChange={(event) =>
                                        setCaptchaAnswer(event.target.value)
                                    }
                                    aria-label="Jawaban CAPTCHA"
                                    placeholder="Ketik kode"
                                    className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCaptcha(createCaptcha());
                                        setCaptchaAnswer("");
                                    }}
                                    aria-label="Ganti soal CAPTCHA"
                                    title="Ganti soal CAPTCHA"
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                >
                                    <RotateCcw size={16} />
                                </button>
                            </div>
                        </div>
                        {err && (
                            <div className="mt-4 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3.5">
                                <span className="text-red-500 flex-shrink-0">
                                    ⚠
                                </span>
                                <p className="text-sm text-red-600">{err}</p>
                            </div>
                        )}
                        <button
                            type="submit"
                            onClick={submit}
                            onMouseMove={(event) => {
                                const bounds =
                                    event.currentTarget.getBoundingClientRect();
                                event.currentTarget.style.setProperty(
                                    "--glow-x",
                                    `${event.clientX - bounds.left}px`,
                                );
                                event.currentTarget.style.setProperty(
                                    "--glow-y",
                                    `${event.clientY - bounds.top}px`,
                                );
                            }}
                            disabled={loading || !email || !pw || !captchaAnswer}
                            className="login-submit group relative mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:border-blue-400 hover:text-blue-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.35)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <span>
                                {loading
                                    ? "Memverifikasi..."
                                    : "Masuk ke Sistem"}
                            </span>
                            {!loading && (
                                <span className="transition-transform duration-300 group-hover:translate-x-1">
                                    →
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CommandPalette({ onNav }: { onNav: (screen: Screen) => void }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const commands = [
        {
            label: "Dashboard jaringan",
            hint: "Ringkasan NOC",
            screen: "dashboard-admin" as Screen,
        },
        {
            label: "Profil OPD dan inventaris",
            hint: "Data aset jaringan",
            screen: "master-opd" as Screen,
        },
        {
            label: "Tiket perlu tindakan",
            hint: "Operasional NOC",
            screen: "kelola-tiket" as Screen,
        },
        {
            label: "Laporan SPBE",
            hint: "Ekspor dan rekap",
            screen: "laporan" as Screen,
        },
    ];
    const filtered = commands.filter((command) =>
        `${command.label} ${command.hint}`
            .toLowerCase()
            .includes(query.toLowerCase()),
    );

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "k"
            ) {
                event.preventDefault();
                setOpen(true);
            }
            if (event.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="inline-flex h-[42px] w-[180px] shrink-0 self-end items-center justify-between gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 shadow-sm hover:border-blue-300 hover:text-blue-700"
            >
                <Command size={15} />
                Cari cepat
                <kbd className="hidden rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 sm:inline">
                    Ctrl K
                </kbd>
            </button>
            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/20 p-4 pt-[12vh] backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                            <SearchCheck size={18} className="text-blue-600" />
                            <input
                                autoFocus
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder="Cari OPD, IP, perangkat, atau menu..."
                                className="w-full border-0 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                            />
                            <button
                                onClick={() => setOpen(false)}
                                className="text-xs text-slate-400"
                            >
                                Esc
                            </button>
                        </div>
                        <div className="p-2">
                            {filtered.map((command) => (
                                <button
                                    key={command.screen}
                                    onClick={() => {
                                        onNav(command.screen);
                                        setOpen(false);
                                    }}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-blue-50"
                                >
                                    <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                                        <ArrowRight size={15} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {command.label}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {command.hint}
                                        </p>
                                    </div>
                                </button>
                            ))}
                            {!filtered.length && (
                                <p className="px-3 py-5 text-center text-sm text-slate-400">
                                    Tidak ada menu yang cocok.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function NocOverview({
    onNav,
    opds,
    profilings,
    tickets,
}: {
    onNav: (screen: Screen) => void;
    opds: OpdDashboardRecord[];
    profilings: ProfilingRecord[];
    tickets: Array<{
        id: string;
        opd: string;
        kendala: string;
        status: string;
        tanggal: string;
    }>;
}) {
    const [healthFilter, setHealthFilter] = useState("Semua OPD");
    const latestProfilingByOpd = new Map<number, ProfilingRecord>();
    for (const profiling of profilings) {
        if (profiling.opd_id == null) continue;
        const current = latestProfilingByOpd.get(profiling.opd_id);
        if (!current || profiling.periode > current.periode) {
            latestProfilingByOpd.set(profiling.opd_id, profiling);
        }
    }
    const latestProfilings = [...latestProfilingByOpd.values()];
    const measuredProfilings = latestProfilings.filter(
        (profiling) => profiling.speed_test,
    );
    const suitableCount = measuredProfilings.filter(
        (profiling) => profiling.speed_test?.hasil === "sesuai",
    ).length;
    const suitablePercent = measuredProfilings.length
        ? Math.round((suitableCount / measuredProfilings.length) * 100)
        : null;
    const pingValues = latestProfilings
        .map((profiling) => Number(profiling.speed_test?.ping_ms))
        .filter((ping) => Number.isFinite(ping) && ping >= 0);
    const averagePing = pingValues.length
        ? Math.round(pingValues.reduce((sum, ping) => sum + ping, 0) / pingValues.length)
        : null;
    const totalDevices = latestProfilings.reduce(
        (sum, profiling) => sum + profiling.jumlah_device,
        0,
    );
    const activeConnections = opds.flatMap((opd) =>
        (opd.koneksi_internet ?? []).filter(
            (connection) => connection.status === "aktif",
        ),
    );
    const totalBandwidthMbps = activeConnections.reduce(
        (sum, connection) => sum + Number(connection.bandwidth_mbps),
        0,
    );
    const connectedOpdCount = opds.filter((opd) =>
        opd.koneksi_internet?.some(
            (connection) => connection.status === "aktif",
        ),
    ).length;
    const opdHealth = opds.map((opd) => {
        const profiling = latestProfilingByOpd.get(opd.id);
        const result = profiling?.speed_test?.hasil;
        return {
            name: opd.nama_opd,
            status:
                result === "sesuai"
                    ? "Sesuai"
                    : result === "tidak_sesuai"
                      ? "Tidak sesuai"
                      : "Belum ada data",
            health:
                result === "sesuai"
                    ? "Sesuai"
                    : result === "tidak_sesuai"
                      ? "Tidak sesuai"
                      : "—",
            latency:
                profiling?.speed_test?.ping_ms == null
                    ? "Ping belum dicatat"
                    : `Ping ${profiling.speed_test.ping_ms} ms`,
        };
    });
    const filtered = opdHealth.filter(
        (opd) =>
            healthFilter === "Semua OPD" || opd.status === healthFilter,
    );
    const activeTickets = tickets.filter((ticket) =>
        ["Baru", "Diteruskan", "Proses", "Menunggu Verifikasi"].includes(
            ticket.status,
        ),
    );
    return (
        <>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="p-5 lg:col-span-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <div className="mb-1 flex items-center gap-2">
                                <Activity size={17} className="text-blue-600" />
                                <h3 className="text-sm font-bold text-slate-800">
                                    Hasil Speed Test
                                </h3>
                            </div>
                            <p className="text-xs text-slate-400">
                                Persentase profiling terbaru dengan hasil sesuai
                            </p>
                        </div>
                        <span className="text-3xl font-extrabold text-blue-700">
                            {suitablePercent == null
                                ? "—"
                                : `${suitablePercent}%`}
                        </span>
                    </div>
                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${suitablePercent ?? 0}%` }}
                        />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                        <div>
                            <p className="text-slate-400">Profiling terbaru</p>
                            <p className="font-bold text-slate-800">
                                {latestProfilings.length}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-400">Hasil sesuai</p>
                            <p className="font-bold text-slate-800">
                                {measuredProfilings.length
                                    ? `${suitableCount}/${measuredProfilings.length}`
                                    : "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-400">Rata-rata Ping</p>
                            <p className="font-bold text-slate-800">
                                {averagePing == null ? "—" : `${averagePing} ms`}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5">
                    <div className="flex items-center gap-2">
                        <Gauge size={17} className="text-indigo-600" />
                        <h3 className="text-sm font-bold text-slate-800">
                            Bandwidth Kabupaten
                        </h3>
                    </div>
                    <p className="mt-3 text-3xl font-extrabold text-slate-900">
                        {(totalBandwidthMbps / 1000).toFixed(2)}{" "}
                        <span className="text-base font-semibold text-slate-400">
                            Gbps
                        </span>
                    </p>
                    <div className="mt-3 h-2 rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{
                                width: `${
                                    totalBandwidthMbps
                                        ? Math.min(
                                              100,
                                              (activeConnections.length /
                                                  Math.max(opds.length, 1)) *
                                                  100,
                                          )
                                        : 0
                                }%`,
                            }}
                        />
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                        Total kapasitas dari {activeConnections.length} koneksi
                        aktif
                    </p>
                </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="p-5 lg:col-span-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800">
                                Health OPD dan status link
                            </h3>
                            <p className="text-xs text-slate-400">
                                Hasil speed test dari profiling terbaru tiap OPD
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
                            {[
                                "Semua OPD",
                                "Sesuai",
                                "Tidak sesuai",
                                "Belum ada data",
                            ].map((item) => (
                                <button
                                    key={item}
                                    onClick={() => setHealthFilter(item)}
                                    className={`rounded-lg px-2.5 py-1.5 text-[10px] font-semibold ${healthFilter === item ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
                        {filtered.map((opd) => (
                            <button
                                key={opd.name}
                                onClick={() => onNav("master-opd")}
                                className="flex w-full items-center justify-between rounded-xl border border-slate-100 p-3 text-left hover:border-blue-200 hover:bg-blue-50/40"
                            >
                                <span className="flex items-center gap-3">
                                    <span
                                        className={`h-2.5 w-2.5 rounded-full ${opd.status === "Sesuai" ? "bg-emerald-500" : opd.status === "Tidak sesuai" ? "bg-red-500" : "bg-slate-300"}`}
                                    />
                                    <span>
                                        <span className="block text-sm font-semibold text-slate-800">
                                            {opd.name}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {opd.status} · {opd.latency}
                                        </span>
                                    </span>
                                </span>
                                <span className="text-sm font-bold text-blue-700">
                                    {opd.health}
                                </span>
                            </button>
                        ))}
                        {filtered.length === 0 && (
                            <p className="py-4 text-sm text-slate-400">
                                Tidak ada OPD pada filter ini.
                            </p>
                        )}
                    </div>
                </Card>
                <Card className="p-5">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={17} className="text-amber-500" />
                        <h3 className="text-sm font-bold text-slate-800">
                            Alert perlu tindakan
                        </h3>
                    </div>
                    <div className="mt-4 space-y-4">
                        {activeTickets.slice(0, 3).map((ticket) => (
                            <div key={ticket.id} className="flex gap-3">
                                <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-800">
                                        {ticket.id} · {ticket.opd}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {ticket.kendala} · {ticket.status}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {activeTickets.length === 0 && (
                            <p className="text-sm text-slate-400">
                                Tidak ada tiket aktif yang memerlukan tindakan.
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => onNav("kelola-tiket")}
                        className="mt-5 text-xs font-bold text-blue-700"
                    >
                        Buka antrean tiket →
                    </button>
                </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <Server size={19} className="text-blue-600" />
                        <div>
                            <p className="text-xs text-slate-400">
                                Perangkat dalam profiling terbaru
                            </p>
                            <p className="text-xl font-extrabold text-slate-800">
                                {totalDevices}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <ShieldCheck size={19} className="text-emerald-600" />
                        <div>
                            <p className="text-xs text-slate-400">
                                SLA vendor
                            </p>
                            <p className="text-xl font-extrabold text-slate-800">
                                —
                            </p>
                            <p className="text-xs text-slate-400">
                                Data SLA belum tersedia
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <MapPinned size={19} className="text-indigo-600" />
                        <div>
                            <p className="text-xs text-slate-400">
                                OPD dengan koneksi aktif
                            </p>
                            <p className="text-xl font-extrabold text-slate-800">
                                {connectedOpdCount} / {opds.length}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
}

// ─── Dashboard Admin ──────────────────────────────────────────────────────────
function DashboardAdmin({
    onNav,
    opds,
    profilings,
    tickets,
}: {
    onNav: (s: Screen) => void;
    opds: OpdDashboardRecord[];
    profilings: ProfilingRecord[];
    tickets: any[];
}) {
    const monthAbbreviations = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Ags",
        "Sep",
        "Okt",
        "Nov",
        "Des",
    ];
    const getPeriod = (date: string) => {
        const [yearValue, monthValue] = date.slice(0, 7).split("-").map(Number);
        if (!yearValue || !monthValue || monthValue > 12) return "";
        return `${monthAbbreviations[monthValue - 1]} ${yearValue}`;
    };
    const periodOrder = (value: string) => {
        const [month, yearValue] = value.split(" ");
        return Number(yearValue) * 12 + monthAbbreviations.indexOf(month);
    };
    const [opdFilter, setOpdFilter] = useState("Semua OPD");
    const [periodFilter, setPeriodFilter] = useState("Semua Periode");
    const opdOptions = opds.map((opd) => opd.nama_opd);
    const dashboardRows = profilings.map((profiling) => {
        const connection = profiling.opd?.koneksi_internet?.find(
            (item) => item.status === "aktif",
        );
        const speedTest = profiling.speed_test;
        const periodParts = profiling.periode.split("-").map(Number);
        const isSuitable = speedTest?.hasil === "sesuai";
        const isUnsuitable = speedTest?.hasil === "tidak_sesuai";

        return {
            id: profiling.id,
            opdId: profiling.opd_id,
            opd: profiling.opd?.nama_opd ?? "OPD",
            date: profiling.periode,
            bandwidth: `${connection?.bandwidth_mbps ?? 0} Mbps`,
            dl: Number(speedTest?.kecepatan_unduh ?? 0),
            ul: Number(speedTest?.kecepatan_unggah ?? 0),
            tiket: tickets.filter(
                (ticket) =>
                    ticket.kendala?.profiling?.id === profiling.id,
            ).length,
            profiling: profiling.status_verifikasi,
            year: periodParts[0] ?? 0,
            month: periodParts[1] ?? 0,
            baik: isSuitable ? 100 : 0,
            sedang: 0,
            buruk: isUnsuitable ? 100 : 0,
        };
    });
    const dashboardTickets = tickets.map((ticket) => ({
        id: ticket.nomor_tiket,
        opd: ticket.kendala?.profiling?.opd?.nama_opd ?? "OPD",
        kendala: getProfilingIssueLabel(
            ticket.kendala ?? { jenis_kendala: "" },
        ),
        deskripsi: ticket.kendala?.deskripsi ?? "",
        status: {
            baru: "Baru",
            diteruskan: "Diteruskan",
            proses: "Proses",
            menunggu_verifikasi: "Menunggu Verifikasi",
            selesai: "Selesai",
            ditolak: "Ditolak",
        }[ticket.status] ?? ticket.status,
        tanggal: ticket.created_at ?? "",
        vendor: ticket.pihak_ketiga?.nama_vendor ?? null,
        prioritas:
            ticket.urgensi === "tinggi"
                ? "Tinggi"
                : ticket.urgensi === "rendah"
                  ? "Rendah"
                  : "Sedang",
    }));
    const periodOptions = [
        "Semua Periode",
        ...Array.from(
            new Set([
                ...profilings.map((profiling) => getPeriod(profiling.periode)),
                ...dashboardTickets.map((ticket) => getPeriod(ticket.tanggal)),
            ]),
        )
            .filter(Boolean)
            .sort((left, right) => periodOrder(right) - periodOrder(left)),
    ];
    const matchesOpd = (name: string) => opdFilter === "Semua OPD" || name === opdFilter;
    const matchesPeriod = (date: string) =>
        periodFilter === "Semua Periode" || getPeriod(date) === periodFilter;
    const filteredRows = dashboardRows.filter(
        (row) =>
            matchesOpd(row.opd) &&
            matchesPeriod(row.date),
    );
    const filteredTickets = dashboardTickets.filter(
        (ticket) => matchesOpd(ticket.opd) && matchesPeriod(ticket.tanggal),
    );
    const filteredProfilings = profilings.filter(
        (profiling) =>
            profiling.status_verifikasi === "diajukan" &&
            matchesOpd(profiling.opd?.nama_opd ?? "") &&
            matchesPeriod(profiling.periode),
    ).map(toProfilingQueueItem);
    const conditionCounts = filteredRows.reduce(
        (counts, row) => {
            const profiling = profilings.find((item) => item.id === row.id);
            const result = profiling?.speed_test?.hasil;
            if (result === "sesuai") counts.baik += 1;
            if (result === "tidak_sesuai") counts.buruk += 1;
            return counts;
        },
        { baik: 0, sedang: 0, buruk: 0 },
    );
    const measuredConditions = conditionCounts.baik + conditionCounts.buruk;
    const conditionData = kondisiPie.map((condition) => {
        const key = condition.name.toLowerCase() as "baik" | "sedang" | "buruk";
        return {
            ...condition,
            value: measuredConditions
                ? Math.round((conditionCounts[key] / measuredConditions) * 100)
                : 0,
        };
    });
    const ticketTrendData = periodOptions
        .slice(1)
        .reverse()
        .slice(-6)
        .map((period) => {
            const ticketsInPeriod = filteredTickets.filter(
                (ticket) => getPeriod(ticket.tanggal) === period,
            );
            return {
                bulan: period,
                baru: ticketsInPeriod.filter((ticket) => ticket.status === "Baru")
                    .length,
                proses: ticketsInPeriod.filter((ticket) =>
                    ["Proses", "Diteruskan", "Menunggu Verifikasi"].includes(ticket.status),
                ).length,
                selesai: ticketsInPeriod.filter(
                    (ticket) => ticket.status === "Selesai",
                ).length,
            };
        })
        .filter(
            (row) =>
                periodFilter === "Semua Periode" || row.bulan === periodFilter,
        );
    const filteredOpdCount =
        periodFilter === "Semua Periode"
            ? opds.filter((opd) => matchesOpd(opd.nama_opd)).length
            : new Set(filteredRows.map((row) => row.opdId)).size;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Dashboard"
                sub="Rekap kondisi jaringan dan aktivitas sistem dari data terdaftar"
                action={
                    <>
                        <CommandPalette onNav={onNav} />
                        <FSelect
                            options={["Semua OPD", ...opdOptions]}
                            value={opdFilter}
                            onChange={setOpdFilter}
                        />
                        <FSelect
                            options={periodOptions}
                            value={periodFilter}
                            onChange={setPeriodFilter}
                        />
                    </>
                }
            />
            <NocOverview
                onNav={onNav}
                opds={opds}
                profilings={profilings}
                tickets={dashboardTickets}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                <StatCard
                    label="Total OPD"
                    value={filteredOpdCount}
                    icon={<Building2 size={20} />}
                    color="blue"
                />
                <StatCard
                    label="Profiling Diajukan"
                    value={filteredRows.filter((row) => row.profiling === "diajukan").length}
                    icon={<ClipboardList size={20} />}
                    color="amber"
                    sub="Menunggu tinjau"
                />
                <StatCard
                    label="Profiling Diverifikasi"
                    value={filteredRows.filter((row) => row.profiling === "diverifikasi").length}
                    icon={<CheckCircle2 size={20} />}
                    color="green"
                    sub="Bulan ini"
                />
                <StatCard
                    label="Tiket Baru"
                    value={filteredTickets.filter((ticket) => ticket.status === "Baru").length}
                    icon={<XCircle size={20} />}
                    color="red"
                    sub="Perlu tindakan"
                />
                <StatCard
                    label="Tiket Proses"
                    value={filteredTickets.filter((ticket) => ["Proses", "Diteruskan", "Menunggu Verifikasi"].includes(ticket.status)).length}
                    icon={<AlertTriangle size={20} />}
                    color="amber"
                />
                <StatCard
                    label="Tiket Selesai"
                    value={filteredTickets.filter((ticket) => ticket.status === "Selesai").length}
                    icon={<CheckCircle2 size={20} />}
                    color="green"
                />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2 p-5">
                    <h3 className="font-bold text-slate-700 mb-4 text-sm">
                        Kondisi Jaringan per OPD (%)
                    </h3>
                    <ResponsiveContainer width="100%" height={210}>
                        <BarChart data={filteredRows} barSize={16}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f1f5f9"
                            />
                            <XAxis
                                dataKey="opd"
                                tick={{ fontSize: 10, fill: "#94a3b8" }}
                            />
                            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: "12px",
                                    border: "none",
                                    boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                                }}
                            />
                            <Bar
                                dataKey="baik"
                                name="Baik"
                                fill="#22c55e"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="sedang"
                                name="Sedang"
                                fill="#f59e0b"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="buruk"
                                name="Buruk"
                                fill="#ef4444"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card className="p-5">
                    <h3 className="font-bold text-slate-700 mb-3 text-sm">
                        Distribusi Kondisi
                    </h3>
                    <ResponsiveContainer width="100%" height={170}>
                        <PieChart>
                            <Pie
                                data={conditionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={70}
                                dataKey="value"
                            >
                                {kondisiPie.map((e, i) => (
                                    <Cell key={i} fill={e.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-1.5 mt-2">
                        {conditionData.map((d) => (
                            <div
                                key={d.name}
                                className="flex items-center justify-between text-xs"
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{ background: d.color }}
                                    />
                                    <span className="text-slate-500">
                                        {d.name}
                                    </span>
                                </div>
                                <span className="font-bold text-slate-700">
                                    {d.value}%
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            <Card className="p-5">
                <h3 className="font-bold text-slate-700 mb-4 text-sm">
                    Tren Tiket 6 Bulan Terakhir
                </h3>
                <ResponsiveContainer width="100%" height={190}>
                    <LineChart data={ticketTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            dataKey="bulan"
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                        />
                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <Tooltip
                            contentStyle={{
                                borderRadius: "12px",
                                border: "none",
                                boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="baru"
                            name="Baru"
                            stroke="#3b82f6"
                            strokeWidth={2.5}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="proses"
                            name="Proses"
                            stroke="#f59e0b"
                            strokeWidth={2.5}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="selesai"
                            name="Selesai"
                            stroke="#22c55e"
                            strokeWidth={2.5}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-slate-700 text-sm">
                                Antrean Verifikasi Profiling
                            </h3>
                            <p className="text-xs text-slate-400">
                                Menunggu tindakan Admin
                            </p>
                        </div>
                        <Btn
                            variant="ghost"
                            small
                            onClick={() => onNav("verifikasi-profiling")}
                        >
                            Lihat semua →
                        </Btn>
                    </div>
                    {filteredProfilings.map((p) => (
                        <div
                            key={p.id}
                            className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0"
                        >
                            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-sm font-bold flex-shrink-0">
                                {p.opd[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">
                                    {p.opd}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {p.diajukan} · {p.bandwidth}
                                </p>
                            </div>
                            <Btn
                                small
                                onClick={() => onNav("verifikasi-profiling")}
                            >
                                Tinjau
                            </Btn>
                        </div>
                    ))}
                </Card>
                <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-slate-700 text-sm">
                                Tiket Perlu Tindakan
                            </h3>
                            <p className="text-xs text-slate-400">
                                Status Baru — belum ditindaklanjuti
                            </p>
                        </div>
                        <Btn
                            variant="ghost"
                            small
                            onClick={() => onNav("kelola-tiket")}
                        >
                            Lihat semua →
                        </Btn>
                    </div>
                    {filteredTickets
                        .filter((t) => t.status === "Baru")
                        .map((t) => (
                            <div
                                key={t.id}
                                className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0"
                            >
                                <Dot color="red" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800">
                                        {t.id} — {t.kendala}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {t.opd} · {t.tanggal}
                                    </p>
                                </div>
                                <Badge
                                    label={t.prioritas}
                                    color={
                                        t.prioritas === "Tinggi"
                                            ? "red"
                                            : "yellow"
                                    }
                                />
                            </div>
                        ))}
                </Card>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
                <Btn onClick={() => onNav("verifikasi-profiling")}>
                    <ClipboardCheck size={16} /> Verifikasi Profiling
                </Btn>
                <Btn variant="secondary" onClick={() => onNav("kelola-tiket")}>
                    <Ticket size={16} /> Kelola Tiket
                </Btn>
                <Btn variant="secondary" onClick={() => onNav("laporan")}>
                    <BarChart3 size={16} /> Lihat Laporan
                </Btn>
            </div>
        </div>
    );
}

// ─── Master OPD ───────────────────────────────────────────────────────────────
function MasterOPD({
    opds,
    onChanged,
}: {
    opds: OpdDashboardRecord[];
    onChanged: (opds: OpdDashboardRecord[]) => void;
}) {
    type OpdRow = {
        id: number;
        nama: string;
        alamat: string;
        pegawai: number | null;
        koneksi: number;
        profiling: string;
        profilingPeriod: string | null;
    };
    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const employeeCount = (opd: OpdDashboardRecord) =>
        opd.jumlah_pegawai && opd.jumlah_pegawai > 0
            ? opd.jumlah_pegawai
            : null;
    const mapOpd = (opd: OpdDashboardRecord): OpdRow => {
        const latestProfiling = [...(opd.data_profiling ?? [])]
            .filter((profiling) => profiling.periode <= currentPeriod)
            .sort(
                (left, right) => right.periode.localeCompare(left.periode),
            )[0];
        const statusLabels: Record<string, string> = {
            draft: "Draft",
            diajukan: "Diajukan",
            diverifikasi: "Diverifikasi",
            dikembalikan: "Dikembalikan",
        };
        return {
            id: opd.id,
            nama: opd.nama_opd,
            alamat: opd.alamat ?? "",
            pegawai: employeeCount(opd),
            koneksi: (opd.koneksi_internet ?? []).filter(
                (connection) => connection.status === "aktif",
            ).length,
            profiling: latestProfiling
                ? statusLabels[latestProfiling.status_verifikasi] ??
                  latestProfiling.status_verifikasi
                : "Belum",
            profilingPeriod: latestProfiling?.periode ?? null,
        };
    };
    const [data, setData] = useState<OpdRow[]>(opds.map(mapOpd));
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
    const [editing, setEditing] = useState<OpdRow | null>(null);
    const [form, setForm] = useState({ nama: "", alamat: "", pegawai: "" });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [requestError, setRequestError] = useState("");
    const [saving, setSaving] = useState(false);

    const filtered = data.filter(
        (o) =>
            o.nama.toLowerCase().includes(search.toLowerCase()) ||
            o.alamat.toLowerCase().includes(search.toLowerCase()),
    );

    const openAdd = () => {
        setForm({ nama: "", alamat: "", pegawai: "" });
        setErrors({});
        setModal("add");
    };
    const openEdit = (o: OpdRow) => {
        setEditing(o);
        setForm({
            nama: o.nama,
            alamat: o.alamat,
            pegawai: String(o.pegawai ?? ""),
        });
        setErrors({});
        setModal("edit");
    };
    const openDelete = (o: OpdRow) => {
        setEditing(o);
        setModal("delete");
    };

    const validate = () => {
        setRequestError("");
        const e: Record<string, string> = {};
        if (!form.nama.trim()) e.nama = "Nama OPD wajib diisi";
        if (!form.alamat.trim()) e.alamat = "Alamat wajib diisi";
        if (
            !form.pegawai ||
            isNaN(Number(form.pegawai)) ||
            Number(form.pegawai) <= 0
        )
            e.pegawai = "Jumlah pegawai harus angka positif";
        setErrors(e);
        return Object.keys(e).length === 0;
    };
    const save = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            const payload = {
                nama_opd: form.nama,
                alamat: form.alamat,
                jumlah_pegawai: Number(form.pegawai),
            };
            const response =
                modal === "add"
                    ? await axios.post(route("opd.store"), payload, {
                          headers: { Accept: "application/json" },
                      })
                    : await axios.put(
                          route("opd.update", { opd: editing?.id }),
                          payload,
                          { headers: { Accept: "application/json" } },
                      );
            const savedOpd = response.data.opd as OpdDashboardRecord;
            const nextOpds =
                modal === "add"
                    ? [...opds, savedOpd]
                    : opds.map((opd) =>
                          opd.id === savedOpd.id ? savedOpd : opd,
                      );
            onChanged(nextOpds);
            setData(nextOpds.map(mapOpd));
            setModal(null);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const backendErrors = error.response?.data?.errors ?? {};
                setErrors({
                    nama: backendErrors.nama_opd?.[0] ?? "",
                    alamat: backendErrors.alamat?.[0] ?? "",
                    pegawai:
                        backendErrors.jumlah_pegawai?.[0] ?? "",
                });
                setRequestError(
                    error.response?.data?.message ??
                        "Data OPD gagal disimpan. Silakan coba lagi.",
                );
            } else {
                setRequestError("Terjadi kesalahan saat menyimpan data OPD.");
            }
        } finally {
            setSaving(false);
        }
    };
    const del = async () => {
        if (!editing) return;
        setRequestError("");
        setSaving(true);
        try {
            await axios.delete(route("opd.destroy", { opd: editing.id }), {
                headers: { Accept: "application/json" },
            });
            const nextOpds = opds.filter((opd) => opd.id !== editing.id);
            onChanged(nextOpds);
            setData(nextOpds.map(mapOpd));
            setModal(null);
        } catch (error) {
            setRequestError(
                axios.isAxiosError(error)
                    ? error.response?.data?.message ??
                          "Data OPD gagal dihapus."
                    : "Terjadi kesalahan saat menghapus data OPD.",
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="Data OPD"
                sub="Kelola Organisasi Perangkat Daerah yang terdaftar dalam sistem"
                action={<Btn onClick={openAdd}>＋ Tambah OPD</Btn>}
            />
            {requestError && (
                <div className="mb-4">
                    <InfoBox type="error">{requestError}</InfoBox>
                </div>
            )}
            <Card>
                <div className="p-4 border-b border-slate-100">
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        placeholder="Cari nama OPD atau alamat..."
                    />
                </div>
                {/* Mobile */}
                <div className="lg:hidden divide-y divide-slate-100">
                    {filtered.map((o) => (
                        <div key={o.id} className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-semibold text-slate-800 text-sm">
                                        {o.nama}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {o.alamat || "Alamat belum diisi"}
                                    </p>
                                </div>
                                {statusBadge(o.profiling)}
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <p className="text-slate-400">Pegawai</p>
                                    <p className="mt-0.5 font-medium text-slate-700">
                                        {o.pegawai ?? "Belum diisi"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-400">
                                        Koneksi aktif
                                    </p>
                                    <p className="mt-0.5 font-medium text-slate-700">
                                        {o.koneksi}
                                    </p>
                                </div>
                                {o.profilingPeriod && (
                                    <div>
                                        <p className="text-slate-400">
                                            Periode profiling
                                        </p>
                                        <p className="mt-0.5 font-medium text-slate-700">
                                            {new Date(
                                                `${o.profilingPeriod}-01T00:00:00`,
                                            ).toLocaleDateString("id-ID", {
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1">
                                <Btn
                                    variant="secondary"
                                    small
                                    onClick={() => openEdit(o)}
                                >
                                    <Pencil size={14} /> Edit
                                </Btn>
                                <Btn
                                    variant="danger"
                                    small
                                    onClick={() => openDelete(o)}
                                >
                                    <Trash2 size={14} /> Hapus
                                </Btn>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Desktop */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full min-w-[980px] text-sm">
                        <thead>
                            <tr className="border-b border-slate-100">
                                {[
                                    "No",
                                    "Nama OPD",
                                    "Alamat",
                                    "Pegawai",
                                    "Koneksi Aktif",
                                    "Status Profiling",
                                    "Aksi",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="whitespace-nowrap text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((o, i) => (
                                <tr
                                    key={o.id}
                                    className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors"
                                >
                                    <td className="px-4 py-3.5 font-mono text-xs text-slate-400">
                                        {String(i + 1).padStart(2, "0")}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <p className="font-semibold text-slate-800">
                                            {o.nama}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3.5 text-slate-500 text-xs max-w-[180px] truncate">
                                        {o.alamat}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                                        {o.pegawai ?? (
                                            <span className="text-slate-400 whitespace-nowrap">
                                                Belum diisi
                                            </span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                                        {o.koneksi}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex min-w-[130px] flex-col items-start gap-1">
                                            {statusBadge(o.profiling)}
                                            {o.profilingPeriod && (
                                                <span className="text-xs text-slate-400">
                                                    {new Date(
                                                        `${o.profilingPeriod}-01T00:00:00`,
                                                    ).toLocaleDateString(
                                                        "id-ID",
                                                        {
                                                            month: "short",
                                                            year: "numeric",
                                                        },
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex w-max flex-nowrap gap-2">
                                            <Btn
                                                variant="secondary"
                                                small
                                                onClick={() => openEdit(o)}
                                            >
                                                <Pencil size={14} /> Edit
                                            </Btn>
                                            <Btn
                                                variant="danger"
                                                small
                                                onClick={() => openDelete(o)}
                                            >
                                                <Trash2 size={14} />
                                            </Btn>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <p className="text-center text-slate-400 py-10 text-sm">
                            Tidak ada data yang cocok.
                        </p>
                    )}
                </div>
            </Card>

            {(modal === "add" || modal === "edit") && (
                <Modal
                    title={
                        modal === "add" ? "Tambah OPD Baru" : "Edit Data OPD"
                    }
                    onClose={() => setModal(null)}
                >
                    <div className="p-6 space-y-4">
                        <InfoBox type="info">
                            Pastikan data sudah sesuai data resmi instansi. Nama
                            OPD digunakan di seluruh sistem.
                        </InfoBox>
                        <FInput
                            label="Nama OPD"
                            placeholder="Dinas Pendidikan dan Kebudayaan"
                            value={form.nama}
                            onChange={(v) => setForm({ ...form, nama: v })}
                            error={errors.nama}
                            required
                        />
                        <FInput
                            label="Alamat Kantor"
                            placeholder="Jl. Ahmad Yani No. 12"
                            value={form.alamat}
                            onChange={(v) => setForm({ ...form, alamat: v })}
                            error={errors.alamat}
                            required
                        />
                        <FInput
                            label="Jumlah Pegawai"
                            type="number"
                            placeholder="100"
                            value={form.pegawai}
                            onChange={(v) => setForm({ ...form, pegawai: v })}
                            error={errors.pegawai}
                            required
                            hint="Jumlah total ASN aktif"
                        />
                    </div>
                    <div className="px-6 pb-6 flex gap-3">
                        <Btn disabled={saving} onClick={save}>
                            <Save size={15} />{" "}
                            {saving ? "Menyimpan..." : "Simpan Data"}
                        </Btn>
                        <Btn variant="secondary" onClick={() => setModal(null)}>
                            Batal
                        </Btn>
                    </div>
                </Modal>
            )}
            {modal === "delete" && editing && (
                <ConfirmModal
                    title={`Hapus ${editing.nama}?`}
                    message="Data OPD, profiling, dan histori tiket terkait akan dihapus permanen. Tindakan tidak dapat dibatalkan."
                    onConfirm={del}
                    onCancel={() => setModal(null)}
                    danger
                />
            )}
        </div>
    );
}

// ─── Master User ──────────────────────────────────────────────────────────────
function MasterUser({
    users,
    opds,
    vendors,
    onChanged,
}: {
    users: UserDashboardRecord[];
    opds: OpdDashboardRecord[];
    vendors: VendorDashboardRecord[];
    onChanged: (users: UserDashboardRecord[]) => void;
}) {
    type UserRow = {
        id: number;
        nama: string;
        email: string;
        role: string;
        relasi: string;
        relasiId: string;
        status: string;
    };
    const mapUser = (user: UserDashboardRecord): UserRow => ({
        id: user.id,
        nama: user.nama,
        email: user.email,
        role:
            user.role === "pihak_ketiga"
                ? "Vendor"
                : user.role === "opd"
                  ? "OPD"
                  : "Admin",
        relasi: user.opd?.nama_opd ?? user.pihak_ketiga?.nama_vendor ?? "—",
        relasiId: String(user.opd_id ?? user.pihak_ketiga_id ?? ""),
        status: user.status === "aktif" ? "Aktif" : "Nonaktif",
    });
    const [data, setData] = useState<UserRow[]>(() => users.map(mapUser));
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("Semua Role");
    const [statusFilter, setStatusFilter] = useState("Semua Status");
    const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
    const [editing, setEditing] = useState<UserRow | null>(null);
    const [form, setForm] = useState({
        nama: "",
        email: "",
        pw: "",
        role: "opd",
        relasiId: "",
        status: "aktif",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [requestError, setRequestError] = useState("");
    const [saving, setSaving] = useState(false);
    const filteredUsers = data.filter((user) => {
        const matchesSearch = `${user.nama} ${user.email} ${user.relasi}`
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesRole =
            roleFilter === "Semua Role" || user.role === roleFilter;
        const matchesStatus =
            statusFilter === "Semua Status" || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const openAdd = () => {
        setForm({
            nama: "",
            email: "",
            pw: "",
            role: "opd",
            relasiId: "",
            status: "aktif",
        });
        setErrors({});
        setRequestError("");
        setModal("add");
    };
    const openEdit = (u: UserRow) => {
        setEditing(u);
        setForm({
            nama: u.nama,
            email: u.email,
            pw: "",
            role:
                u.role === "Vendor"
                    ? "pihak_ketiga"
                    : u.role === "OPD"
                      ? "opd"
                      : "admin",
            relasiId: u.relasiId,
            status: u.status === "Aktif" ? "aktif" : "nonaktif",
        });
        setErrors({});
        setRequestError("");
        setModal("edit");
    };
    const openDelete = (u: UserRow) => {
        setEditing(u);
        setModal("delete");
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.nama.trim()) e.nama = "Nama wajib diisi";
        if (!form.email.includes("@")) e.email = "Format email tidak valid";
        if (modal === "add" && form.pw.length < 8) e.pw = "Min. 8 karakter";
        if (form.role === "opd" && !form.relasiId)
            e.relasi = "Pilih OPD untuk akun ini";
        if (form.role === "pihak_ketiga" && !form.relasiId)
            e.relasi = "Pilih vendor untuk akun ini";
        setErrors(e);
        return Object.keys(e).length === 0;
    };
    const save = async () => {
        if (!validate()) return;
        setSaving(true);
        setRequestError("");
        try {
            const payload = {
                nama: form.nama,
                email: form.email,
                role: form.role,
                opd_id:
                    form.role === "opd" ? Number(form.relasiId) : null,
                pihak_ketiga_id:
                    form.role === "pihak_ketiga"
                        ? Number(form.relasiId)
                        : null,
                status: form.status,
                ...(form.pw ? { password: form.pw } : {}),
            };
            const response =
                modal === "add"
                    ? await axios.post(route("users.store"), payload, {
                          headers: { Accept: "application/json" },
                      })
                    : await axios.put(
                          route("users.update", { user: editing?.id }),
                          payload,
                          { headers: { Accept: "application/json" } },
                      );
            const savedUser = response.data.user as UserDashboardRecord;
            const nextUsers =
                modal === "add"
                    ? [...users, savedUser]
                    : users.map((user) =>
                          user.id === savedUser.id ? savedUser : user,
                      );
            onChanged(nextUsers);
            setData(nextUsers.map(mapUser));
            setModal(null);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const backendErrors = error.response?.data?.errors ?? {};
                setErrors({
                    nama: backendErrors.nama?.[0] ?? "",
                    email: backendErrors.email?.[0] ?? "",
                    pw: backendErrors.password?.[0] ?? "",
                    relasi:
                        backendErrors.opd_id?.[0] ??
                        backendErrors.pihak_ketiga_id?.[0] ??
                        "",
                });
                setRequestError(
                    error.response?.data?.message ??
                        "Akun gagal disimpan. Silakan periksa kembali datanya.",
                );
            } else {
                setRequestError("Terjadi kesalahan saat menyimpan akun.");
            }
        } finally {
            setSaving(false);
        }
    };
    const del = async () => {
        if (!editing) return;
        setSaving(true);
        setRequestError("");
        try {
            await axios.delete(route("users.destroy", { user: editing.id }), {
                headers: { Accept: "application/json" },
            });
            const nextUsers = users.filter((user) => user.id !== editing.id);
            onChanged(nextUsers);
            setData(nextUsers.map(mapUser));
            setModal(null);
        } catch (error) {
            setRequestError(
                axios.isAxiosError(error)
                    ? error.response?.data?.message ?? "Akun gagal dihapus."
                    : "Terjadi kesalahan saat menghapus akun.",
            );
            setModal(null);
        } finally {
            setSaving(false);
        }
    };
    const toggleStatus = async (row: UserRow) => {
        const user = users.find((item) => item.id === row.id);
        if (!user) return;
        setRequestError("");
        try {
            const response = await axios.put(
                route("users.update", { user: user.id }),
                {
                    nama: user.nama,
                    email: user.email,
                    role: user.role,
                    opd_id: user.opd_id,
                    pihak_ketiga_id: user.pihak_ketiga_id,
                    status: user.status === "aktif" ? "nonaktif" : "aktif",
                },
                { headers: { Accept: "application/json" } },
            );
            const updatedUser = response.data.user as UserDashboardRecord;
            const nextUsers = users.map((item) =>
                item.id === updatedUser.id ? updatedUser : item,
            );
            onChanged(nextUsers);
            setData(nextUsers.map(mapUser));
        } catch (error) {
            setRequestError(
                axios.isAxiosError(error)
                    ? error.response?.data?.message ??
                          "Status akun gagal diperbarui."
                    : "Terjadi kesalahan saat memperbarui status akun.",
            );
        }
    };

    return (
        <div>
            <PageHeader
                title="Data User"
                sub="Kelola akun pengguna sistem berdasarkan role dan OPD/vendor"
                action={<Btn onClick={openAdd}>＋ Tambah Akun</Btn>}
            />
            {requestError && !modal && (
                <div className="mb-4">
                    <InfoBox type="error">{requestError}</InfoBox>
                </div>
            )}
            <Card>
                <div className="p-4 border-b border-slate-100 flex gap-3 flex-wrap">
                    <div className="flex-1 min-w-[180px]">
                        <SearchBar
                            value={search}
                            onChange={setSearch}
                            placeholder="Cari nama atau email..."
                        />
                    </div>
                    <FSelect
                        options={["Semua Role", "Admin", "OPD", "Vendor"]}
                        value={roleFilter}
                        onChange={setRoleFilter}
                    />
                    <FSelect
                        options={["Semua Status", "Aktif", "Nonaktif"]}
                        value={statusFilter}
                        onChange={setStatusFilter}
                    />
                </div>
                {/* Mobile */}
                <div className="sm:hidden divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                        <div key={u.id} className="p-4 space-y-2.5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm">
                                        {u.nama[0]}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">
                                            {u.nama}
                                        </p>
                                        <p className="text-xs text-slate-400 font-mono">
                                            {u.email}
                                        </p>
                                    </div>
                                </div>
                                {statusBadge(u.status)}
                            </div>
                            <div className="flex gap-2 flex-wrap items-center">
                                <Badge
                                    label={u.role}
                                    color={
                                        u.role === "Admin"
                                            ? "blue"
                                            : u.role === "OPD"
                                              ? "teal"
                                              : "purple"
                                    }
                                />
                                <span className="text-xs text-slate-400">
                                    {u.relasi}
                                </span>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <Btn
                                    variant="secondary"
                                    small
                                    onClick={() => openEdit(u)}
                                >
                                    <Pencil size={14} /> Edit
                                </Btn>
                                <Btn
                                    variant={
                                        u.status === "Aktif"
                                            ? "danger"
                                            : "success"
                                    }
                                    small
                                    onClick={() => toggleStatus(u)}
                                >
                                    {u.status === "Aktif" ? (
                                        <>
                                            <CircleOff size={14} /> Nonaktifkan
                                        </>
                                    ) : (
                                        <>
                                            <CircleCheck size={14} /> Aktifkan
                                        </>
                                    )}
                                </Btn>
                                <Btn
                                    variant="ghost"
                                    small
                                    onClick={() => openDelete(u)}
                                >
                                    <Trash2 size={14} />
                                </Btn>
                            </div>
                        </div>
                    ))}
                    {filteredUsers.length === 0 && (
                        <p className="px-4 py-8 text-center text-sm text-slate-400">
                            {data.length === 0
                                ? "Belum ada akun pengguna di database."
                                : "Tidak ada akun yang sesuai dengan filter."}
                        </p>
                    )}
                </div>
                {/* Desktop */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100">
                                {[
                                    "Pengguna",
                                    "Role",
                                    "OPD / Vendor",
                                    "Status",
                                    "Aksi",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((u) => (
                                <tr
                                    key={u.id}
                                    className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors"
                                >
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                {u.nama[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800">
                                                    {u.nama}
                                                </p>
                                                <p className="text-xs text-slate-400 font-mono">
                                                    {u.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <Badge
                                            label={u.role}
                                            color={
                                                u.role === "Admin"
                                                    ? "blue"
                                                    : u.role === "OPD"
                                                      ? "teal"
                                                      : "purple"
                                            }
                                        />
                                    </td>
                                    <td className="px-4 py-3.5 text-slate-500 text-sm">
                                        {u.relasi}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        {statusBadge(u.status)}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex gap-2">
                                            <Btn
                                                variant="secondary"
                                                small
                                                onClick={() => openEdit(u)}
                                            >
                                                <Pencil size={14} /> Edit
                                            </Btn>
                                            <Btn
                                                variant={
                                                    u.status === "Aktif"
                                                        ? "danger"
                                                        : "success"
                                                }
                                                small
                                                onClick={() => toggleStatus(u)}
                                            >
                                                {u.status === "Aktif" ? (
                                                    <>
                                                        <CircleOff size={14} />{" "}
                                                        Nonaktifkan
                                                    </>
                                                ) : (
                                                    <>
                                                        <CircleCheck
                                                            size={14}
                                                        />{" "}
                                                        Aktifkan
                                                    </>
                                                )}
                                            </Btn>
                                            <Btn
                                                variant="ghost"
                                                small
                                                onClick={() => openDelete(u)}
                                            >
                                                <Trash2 size={14} />
                                            </Btn>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-8 text-center text-sm text-slate-400"
                                    >
                                        {data.length === 0
                                            ? "Belum ada akun pengguna di database."
                                            : "Tidak ada akun yang sesuai dengan filter."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {(modal === "add" || modal === "edit") && (
                <Modal
                    title={
                        modal === "add" ? "Tambah Akun Pengguna" : "Edit Akun"
                    }
                    onClose={() => setModal(null)}
                >
                    <div className="p-6 space-y-4">
                        {requestError && (
                            <InfoBox type="error">{requestError}</InfoBox>
                        )}
                        <InfoBox type="info">
                            {modal === "add"
                                ? "Akun dapat langsung digunakan setelah disimpan. Kirimkan kredensial secara aman."
                                : "Kosongkan kata sandi jika tidak ingin mengubahnya."}
                        </InfoBox>
                        <FInput
                            label="Nama Lengkap"
                            placeholder="Nama sesuai identitas resmi"
                            value={form.nama}
                            onChange={(v) => setForm({ ...form, nama: v })}
                            error={errors.nama}
                            required
                        />
                        <FInput
                            label="Alamat Email"
                            type="email"
                            placeholder="nama@instansi.go.id"
                            value={form.email}
                            onChange={(v) => setForm({ ...form, email: v })}
                            error={errors.email}
                            required
                            hint="Digunakan sebagai username login"
                        />
                        <FInput
                            label={
                                modal === "add"
                                    ? "Kata Sandi"
                                    : "Kata Sandi Baru (opsional)"
                            }
                            type="password"
                            placeholder="Min. 8 karakter"
                            value={form.pw}
                            onChange={(v) => setForm({ ...form, pw: v })}
                            error={errors.pw}
                            required={modal === "add"}
                        />
                        <FSelect
                            label="Role"
                            options={["Admin", "OPD", "Vendor"]}
                            value={
                                form.role === "pihak_ketiga"
                                    ? "Vendor"
                                    : form.role === "opd"
                                      ? "OPD"
                                      : "Admin"
                            }
                            onChange={(value) =>
                                setForm({
                                    ...form,
                                    role:
                                        value === "Vendor"
                                            ? "pihak_ketiga"
                                            : value.toLowerCase(),
                                    relasiId: "",
                                })
                            }
                        />
                        {form.role === "opd" && (
                            <>
                                <FSelect
                                    label="OPD"
                                    options={opds.map((opd) => opd.nama_opd)}
                                    placeholder="Pilih OPD"
                                    value={
                                        opds.find(
                                            (opd) =>
                                                String(opd.id) ===
                                                form.relasiId,
                                        )?.nama_opd ?? ""
                                    }
                                    onChange={(name) =>
                                        setForm({
                                            ...form,
                                            relasiId: String(
                                                opds.find(
                                                    (opd) =>
                                                        opd.nama_opd === name,
                                                )?.id ?? "",
                                            ),
                                        })
                                    }
                                />
                                {errors.relasi && (
                                    <p className="text-xs text-red-600">
                                        {errors.relasi}
                                    </p>
                                )}
                            </>
                        )}
                        {form.role === "pihak_ketiga" && (
                            <>
                                <FSelect
                                    label="Vendor / Pihak Ketiga"
                                    options={vendors.map(
                                        (vendor) => vendor.nama_vendor,
                                    )}
                                    placeholder="Pilih vendor"
                                    value={
                                        vendors.find(
                                            (vendor) =>
                                                String(vendor.id) ===
                                                form.relasiId,
                                        )?.nama_vendor ?? ""
                                    }
                                    onChange={(name) =>
                                        setForm({
                                            ...form,
                                            relasiId: String(
                                                vendors.find(
                                                    (vendor) =>
                                                        vendor.nama_vendor ===
                                                        name,
                                                )?.id ?? "",
                                            ),
                                        })
                                    }
                                />
                                {errors.relasi && (
                                    <p className="text-xs text-red-600">
                                        {errors.relasi}
                                    </p>
                                )}
                            </>
                        )}
                        <FSelect
                            label="Status Akun"
                            options={["Aktif", "Nonaktif"]}
                            value={
                                form.status === "aktif" ? "Aktif" : "Nonaktif"
                            }
                            onChange={(value) =>
                                setForm({
                                    ...form,
                                    status: value.toLowerCase(),
                                })
                            }
                        />
                    </div>
                    <div className="px-6 pb-6 flex gap-3">
                        <Btn disabled={saving} onClick={save}>
                            <Save size={15} />{" "}
                            {saving ? "Menyimpan..." : "Simpan Akun"}
                        </Btn>
                        <Btn variant="secondary" onClick={() => setModal(null)}>
                            Batal
                        </Btn>
                    </div>
                </Modal>
            )}
            {modal === "delete" && editing && (
                <ConfirmModal
                    title={`Hapus akun ${editing.nama}?`}
                    message="Akun dihapus permanen dan tidak dapat digunakan kembali."
                    onConfirm={del}
                    onCancel={() => setModal(null)}
                    danger
                />
            )}
        </div>
    );
}

// ─── Form Profiling ───────────────────────────────────────────────────────────
function FormProfiling({
    onNav,
    onCreated,
    opdName,
    existingProfiling,
}: {
    onNav: (s: Screen) => void;
    onCreated: (profiling: any) => void;
    opdName?: string | null;
    existingProfiling?: ProfilingRecord;
}) {
    const canEdit =
        !existingProfiling ||
        ["draft", "dikembalikan"].includes(
            existingProfiling.status_verifikasi,
        );
    const now = new Date();
    const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const currentPeriod = todayDate.slice(0, 7);
    const period = existingProfiling?.periode ?? currentPeriod;
    const periodStart = `${period}-01`;
    const periodEnd = `${period}-${String(
        new Date(
            Number(period.slice(0, 4)),
            Number(period.slice(5, 7)),
            0,
        ).getDate(),
    ).padStart(2, "0")}`;
    const maxTestDate =
        period < currentPeriod ? periodEnd : todayDate;
    const existingConnection = existingProfiling?.opd?.koneksi_internet?.find(
        (item) => item.status === "aktif",
    );
    const existingIssueLabels: Record<string, string> = {
        bandwidth_kurang: "Speed Lambat",
        device: "Perangkat Rusak",
        topologi: "Konfigurasi Salah",
        sosialisasi: "Gangguan ISP",
    };
    const [step, setStep] = useState(0);
    const [done, setDone] = useState(false);
    const [profilingId, setProfilingId] = useState<number | null>(
        existingProfiling?.id ?? null,
    );
    const [apps, setApps] = useState(
        existingProfiling?.aplikasi?.map((app) => app.nama_aplikasi) ?? [
            "SIMDA",
            "SIPD",
        ],
    );
    const [kendala, setKendala] = useState(
        existingProfiling?.kendala?.map((item) =>
            item.nama_kendala
                ? "Lainnya"
                : (existingIssueLabels[item.jenis_kendala] ??
                  item.jenis_kendala),
        ) ?? [],
    );
    const [deviceCount, setDeviceCount] = useState(
        String(existingProfiling?.jumlah_device ?? ""),
    );
    const [bandwidth, setBandwidth] = useState(
        String(existingConnection?.bandwidth_mbps ?? ""),
    );
    const [isp, setIsp] = useState(existingConnection?.nama_isp ?? "");
    const [download, setDownload] = useState(
        String(existingProfiling?.speed_test?.kecepatan_unduh ?? ""),
    );
    const [upload, setUpload] = useState(
        String(existingProfiling?.speed_test?.kecepatan_unggah ?? ""),
    );
    const [ping, setPing] = useState(
        String(existingProfiling?.speed_test?.ping_ms ?? ""),
    );
    const [condition, setCondition] = useState(
        existingProfiling?.speed_test?.hasil === "tidak_sesuai"
            ? "Sedang — Ada penurunan performa"
            : "Baik — Kecepatan sesuai bandwidth",
    );
    const [testDate, setTestDate] = useState(() => {
        const savedDate = existingProfiling?.speed_test?.tanggal_test;
        if (
            savedDate &&
            savedDate.startsWith(`${period}-`) &&
            savedDate >= periodStart &&
            savedDate <= maxTestDate
        ) {
            return savedDate;
        }

        return period === currentPeriod ? todayDate : periodStart;
    });
    const [profilingPeriod, setProfilingPeriod] = useState(
        existingProfiling?.periode ?? null,
    );
    const [kendalaDescription, setKendalaDescription] = useState(
        existingProfiling?.kendala
            ?.map((item) => item.deskripsi)
            .filter(Boolean)
            .join("; ") ??
            existingProfiling?.kesimpulan ??
            "",
    );
    const [otherIssueName, setOtherIssueName] = useState(
        existingProfiling?.kendala?.find((item) => item.nama_kendala)
            ?.nama_kendala ?? "",
    );
    const [saveError, setSaveError] = useState("");
    const [saving, setSaving] = useState(false);
    const steps = [
        "Kondisi Umum",
        "Aplikasi",
        "Speed Test",
        "Kendala",
        "Review",
    ];
    const kendalaOpts = [
        "Koneksi Putus",
        "Speed Lambat",
        "Perangkat Rusak",
        "Konfigurasi Salah",
        "Gangguan ISP",
        "Lainnya",
    ];
    const saveProfiling = async (submit: boolean) => {
        setSaveError("");
        if (period > currentPeriod) {
            setSaveError(
                "Profiling untuk bulan mendatang belum dapat dibuat atau diubah.",
            );
            return;
        }
        const kendalaTypes: Record<string, string> = {
            "Koneksi Putus": "bandwidth_kurang",
            "Speed Lambat": "bandwidth_kurang",
            "Perangkat Rusak": "device",
            "Konfigurasi Salah": "topologi",
            "Gangguan ISP": "sosialisasi",
            Lainnya: "lainnya",
        };
        if (kendala.includes("Lainnya") && !otherIssueName.trim()) {
            setSaveError("Jelaskan nama kendala pada pilihan Lainnya.");
            return;
        }
        setSaving(true);
        try {
            const response = await axios.request<{
                profiling: ProfilingRecord;
            }>({
                method: profilingId && profilingPeriod === period ? "put" : "post",
                url: profilingId && profilingPeriod === period
                    ? route("profiling.update", profilingId)
                    : route("profiling.store"),
                data: {
                    periode: period,
                    jumlah_device: deviceCount,
                    bandwidth_mbps: bandwidth,
                    nama_isp: isp,
                    kesimpulan: kendalaDescription || null,
                    aplikasi: apps,
                    kecepatan_unduh: download || null,
                    kecepatan_unggah: upload || null,
                    ping_ms: ping === "" ? null : ping,
                    hasil: condition.startsWith("Baik") ? "sesuai" : "tidak_sesuai",
                    tanggal_test: testDate,
                    kendala: kendala.map((item) => ({
                        jenis_kendala: kendalaTypes[item],
                        nama_kendala:
                            item === "Lainnya" ? otherIssueName.trim() : null,
                        deskripsi: kendalaDescription,
                    })),
                    ajukan: submit,
                },
                headers: { Accept: "application/json" },
            });
            setProfilingId(response.data.profiling.id);
            setProfilingPeriod(response.data.profiling.periode);
            onCreated(response.data.profiling);
            if (submit) setDone(true);
            else setSaveError("Draft profiling berhasil disimpan.");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setSaveError(
                    error.response?.data?.message ??
                        "Profiling gagal disimpan. Periksa kembali data Anda.",
                );
            } else {
                setSaveError("Terjadi kesalahan saat menyimpan profiling.");
            }
        } finally {
            setSaving(false);
        }
    };

    if (done)
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-5">
                    <CheckCircle2 size={36} />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800 mb-3">
                    Profiling Berhasil Diajukan!
                </h2>
                <p className="text-slate-500 max-w-sm leading-relaxed">
                    Data profiling masuk ke antrean verifikasi Admin Diskominfo.
                    Anda akan mendapat notifikasi setelah diproses.
                </p>
                <div className="mt-8 flex gap-3">
                    <Btn
                        onClick={() => {
                            setDone(false);
                            setStep(0);
                        }}
                    >
                        Isi Profiling Baru
                    </Btn>
                    <Btn
                        variant="secondary"
                        onClick={() => onNav("riwayat-profiling")}
                    >
                        <FolderClock size={16} /> Riwayat Profiling
                    </Btn>
                </div>
            </div>
        );

    return (
        <div>
            <PageHeader
                title="Isi Profiling Jaringan"
                sub="Laporkan kondisi infrastruktur jaringan OPD secara berkala"
            />
            {!canEdit && (
                <div className="mb-5">
                    <InfoBox type="info">
                        Profiling periode ini sudah diajukan dan hanya dapat
                        diubah jika Admin mengembalikannya untuk revisi.
                    </InfoBox>
                </div>
            )}
            <div className="flex items-center mb-6 overflow-x-auto pb-2 gap-0">
                {steps.map((s, i) => (
                    <div key={s} className="flex items-center flex-shrink-0">
                        <button
                            onClick={() => i <= step && setStep(i)}
                            className={
                                i <= step ? "cursor-pointer" : "cursor-default"
                            }
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className={clx(
                                        "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold border-2 transition-all flex-shrink-0",
                                        i < step
                                            ? "bg-blue-600 border-blue-600 text-white"
                                            : i === step
                                              ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                                              : "border-slate-200 text-slate-400 bg-white",
                                    )}
                                >
                                    {i < step ? "✓" : i + 1}
                                </div>
                                <span
                                    className={clx(
                                        "text-xs font-semibold whitespace-nowrap hidden sm:block",
                                        i === step
                                            ? "text-blue-600"
                                            : i < step
                                              ? "text-blue-400"
                                              : "text-slate-400",
                                    )}
                                >
                                    {s}
                                </span>
                            </div>
                        </button>
                        {i < steps.length - 1 && (
                            <div
                                className={clx(
                                    "w-6 sm:w-10 h-0.5 mx-1 sm:mx-2 flex-shrink-0",
                                    i < step ? "bg-blue-400" : "bg-slate-200",
                                )}
                            />
                        )}
                    </div>
                ))}
            </div>

            <Card className="p-5 sm:p-7">
                {step === 0 && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                                1
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">
                                    Kondisi Umum Jaringan
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Isi data dasar koneksi internet OPD Anda
                                </p>
                            </div>
                        </div>
                        <FInput
                            label="Nama OPD"
                            value={opdName ?? "Akun belum terhubung ke OPD"}
                            readOnly
                            hint="OPD mengikuti akun yang login"
                        />
                        <FSelect
                            label="Jenis Koneksi Internet"
                            options={[
                                "Fiber Optik",
                                "DSL",
                                "Wireless / Radio",
                                "VSAT",
                            ]}
                            hint="Teknologi jaringan yang digunakan"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FInput
                                label="Bandwidth Berlangganan (Mbps)"
                                type="number"
                                placeholder="100"
                                hint="Sesuai kontrak dengan ISP"
                                    value={bandwidth}
                                    onChange={setBandwidth}
                            />
                            <FInput
                                label="Jumlah Perangkat Terhubung"
                                type="number"
                                placeholder="52"
                                hint="PC, laptop, printer, dll"
                                value={deviceCount}
                                onChange={setDeviceCount}
                            />
                        </div>
                        <FInput
                            label="Nama ISP / Penyedia Layanan"
                            placeholder="PT Telkom Indonesia"
                            hint="Penyedia internet yang digunakan"
                            value={isp}
                            onChange={setIsp}
                        />
                    </div>
                )}
                {step === 1 && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                                2
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">
                                    Daftar Aplikasi
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Aplikasi yang memerlukan koneksi internet
                                </p>
                            </div>
                        </div>
                        <InfoBox type="info">
                            Daftarkan semua aplikasi berbasis web atau cloud.
                            Data ini digunakan untuk analisis kebutuhan
                            bandwidth OPD.
                        </InfoBox>
                        <div className="space-y-2">
                            {apps.map((app, i) => (
                                <div
                                    key={i}
                                    className="flex gap-2 items-center"
                                >
                                    <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500 text-xs font-bold flex-shrink-0">
                                        {i + 1}
                                    </div>
                                    <input
                                        value={app}
                                        onChange={(e) =>
                                            setApps(
                                                apps.map((a, j) =>
                                                    j === i
                                                        ? e.target.value
                                                        : a,
                                                ),
                                            )
                                        }
                                        className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="Nama aplikasi..."
                                    />
                                    {apps.length > 1 && (
                                        <button
                                            onClick={() =>
                                                setApps(
                                                    apps.filter(
                                                        (_, j) => j !== i,
                                                    ),
                                                )
                                            }
                                            className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <Btn
                            variant="secondary"
                            onClick={() => setApps([...apps, ""])}
                        >
                            ＋ Tambah Aplikasi
                        </Btn>
                    </div>
                )}
                {step === 2 && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                                3
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">
                                    Hasil Speed Test
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Pengukuran kecepatan jaringan aktual
                                </p>
                            </div>
                        </div>
                        <InfoBox type="info">
                            Lakukan speed test pada jam kerja (08.00–16.00)
                            menggunakan speedtest.net atau fast.com. Catat
                            hasilnya di bawah.
                        </InfoBox>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <FInput
                                label="Download (Mbps)"
                                type="number"
                                placeholder="0"
                                hint="Kecepatan unduh"
                                value={download}
                                onChange={setDownload}
                            />
                            <FInput
                                label="Upload (Mbps)"
                                type="number"
                                placeholder="0"
                                hint="Kecepatan unggah"
                                value={upload}
                                onChange={setUpload}
                            />
                            <FInput
                                label="Ping (ms)"
                                type="number"
                                placeholder="0"
                                hint="Latensi jaringan"
                                value={ping}
                                onChange={setPing}
                            />
                        </div>
                        <FSelect
                            label="Penilaian Kondisi Umum"
                            options={[
                                "Baik — Kecepatan sesuai bandwidth",
                                "Sedang — Ada penurunan performa",
                                "Buruk — Jaringan sering terganggu",
                            ]}
                            hint="Berdasarkan pengalaman penggunaan sehari-hari"
                            value={condition}
                            onChange={setCondition}
                        />
                        <FInput
                            label="Tanggal Pengukuran"
                            type="date"
                            min={periodStart}
                            max={maxTestDate}
                            hint={`Periode profiling: ${period}. Untuk input baru hanya bulan berjalan yang dapat dipilih.`}
                            value={testDate}
                            onChange={setTestDate}
                        />
                    </div>
                )}
                {step === 3 && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                                4
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">
                                    Kendala Jaringan
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Pilih kendala yang sering dialami 1 bulan
                                    terakhir
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {kendalaOpts.map((k) => (
                                <label
                                    key={k}
                                    className={clx(
                                        "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                                        kendala.includes(k)
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-slate-200 hover:border-blue-300",
                                    )}
                                >
                                    <input
                                        type="checkbox"
                                        checked={kendala.includes(k)}
                                        onChange={(e) =>
                                            setKendala(
                                                e.target.checked
                                                    ? [...kendala, k]
                                                    : kendala.filter(
                                                          (x) => x !== k,
                                                      ),
                                            )
                                        }
                                        className="w-4 h-4 accent-blue-600"
                                    />
                                    <span
                                        className={`text-sm font-medium ${
                                            kendala.includes(k)
                                                ? "text-blue-700"
                                                : "text-slate-700"
                                        }`}
                                    >
                                        {k}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {kendala.includes("Lainnya") && (
                            <FInput
                                label="Sebutkan Kendala Lainnya"
                                placeholder="Contoh: Wi-Fi ruang pelayanan tidak stabil"
                                value={otherIssueName}
                                onChange={setOtherIssueName}
                                required
                            />
                        )}
                        <FTextarea
                            label="Deskripsi Kendala (opsional)"
                            placeholder="Jelaskan detail: kapan terjadi, frekuensi, dampak, langkah yang sudah dicoba..."
                            rows={4}
                            value={kendalaDescription}
                            onChange={setKendalaDescription}
                        />
                    </div>
                )}
                {step === 4 && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 font-bold flex-shrink-0">
                                ✓
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">
                                    Review & Konfirmasi
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Periksa kembali sebelum mengajukan
                                </p>
                            </div>
                        </div>
                        <InfoBox type="warn">
                            Setelah diajukan, data tidak dapat diubah kecuali
                            ditolak Admin. Pastikan seluruh isian sudah benar
                            dan lengkap.
                        </InfoBox>
                        <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
                            {[
                                ["Periode", period],
                                ["OPD", "Sesuai akun yang masuk"],
                                [
                                    "Koneksi",
                                    `${isp || "ISP belum diisi"} · Fiber Optik`,
                                ],
                                ["Bandwidth", `${bandwidth || "-"} Mbps`],
                                ["Jumlah Device", deviceCount || "Belum diisi"],
                                ["Aplikasi", apps.filter(Boolean).join(", ")],
                                [
                                    "Speed Test",
                                    `DL: ${download || "-"} Mbps · UL: ${upload || "-"} Mbps · Ping: ${ping || "-"}ms`,
                                ],
                                ["Kondisi", condition.split(" — ")[0]],
                                [
                                    "Kendala",
                                    kendala.length
                                        ? kendala
                                              .map((item) =>
                                                  item === "Lainnya"
                                                      ? otherIssueName.trim() ||
                                                        "Lainnya (belum dijelaskan)"
                                                      : item,
                                              )
                                              .join(", ")
                                        : "Tidak ada",
                                ],
                            ].map(([k, v]) => (
                                <div
                                    key={k}
                                    className="flex gap-3 py-2 border-b border-slate-200 last:border-0"
                                >
                                    <span className="w-28 sm:w-36 text-xs text-slate-400 font-semibold uppercase tracking-wide flex-shrink-0">
                                        {k}
                                    </span>
                                    <span className="text-sm text-slate-800 font-medium">
                                        {v}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100 flex-wrap gap-3">
                    <div className="flex gap-2">
                        {step > 0 && (
                            <Btn
                                variant="secondary"
                                onClick={() => setStep((s) => s - 1)}
                            >
                                ← Kembali
                            </Btn>
                        )}
                        <Btn
                            variant="ghost"
                            disabled={!canEdit || saving || !deviceCount}
                            onClick={() => saveProfiling(false)}
                        >
                            <Save size={15} /> Simpan Draft
                        </Btn>
                    </div>
                    {step < 4 ? (
                        <Btn onClick={() => setStep((s) => s + 1)}>
                            Lanjutkan →
                        </Btn>
                    ) : (
                        <Btn
                            disabled={
                                !canEdit ||
                                saving ||
                                !deviceCount ||
                                !bandwidth ||
                                !isp
                            }
                            onClick={() => saveProfiling(true)}
                        >
                            <FilePenLine size={16} />{" "}
                            {saving ? "Menyimpan..." : "Ajukan Profiling"}
                        </Btn>
                    )}
                </div>
                {saveError && (
                    <div className="mt-4">
                        <InfoBox
                            type={
                                saveError.startsWith("Draft profiling berhasil")
                                    ? "success"
                                    : "error"
                            }
                        >
                            {saveError}
                        </InfoBox>
                    </div>
                )}
            </Card>
        </div>
    );
}

// ─── Riwayat Profiling ────────────────────────────────────────────────────────
function RiwayatProfiling({
    onContinue,
    profilings,
}: {
    onContinue: (profilingId: number) => void;
    profilings: ProfilingRecord[];
}) {
    const rows = profilings.map((profiling) => {
        const connection = profiling.opd?.koneksi_internet?.find(
            (item) => item.status === "aktif",
        );
        const speedTest = profiling.speed_test;
        return {
            ...riwayatProfiling[0],
            id: profiling.id,
            periode: profiling.periode,
            status: {
                diajukan: "Diajukan",
                diverifikasi: "Diverifikasi",
                dikembalikan: "Dikembalikan",
                draft: "Draft",
            }[profiling.status_verifikasi] ?? profiling.status_verifikasi,
            kondisi: speedTest?.hasil === "sesuai" ? "Baik" : "Sedang",
            dl: Number(speedTest?.kecepatan_unduh ?? 0),
            ul: Number(speedTest?.kecepatan_unggah ?? 0),
            ping:
                speedTest?.ping_ms == null
                    ? "-"
                    : Number(speedTest.ping_ms),
            bandwidth: `${connection?.bandwidth_mbps ?? 0} Mbps`,
            device: profiling.jumlah_device,
            isp: connection?.nama_isp ?? "-",
            apps: (profiling.aplikasi ?? []).map((app) => app.nama_aplikasi),
            kendala:
                profiling.kendala
                    ?.map(getProfilingIssueLabel)
                    .join(", ") || "Tidak ada",
            catatan:
                profiling.kesimpulan ??
                profiling.kendala
                    ?.map((item) => item.deskripsi)
                    .filter(Boolean)
                    .join("; ") ??
                "Belum ada catatan verifikasi.",
            verifikator: profiling.tanggal_diverifikasi ? "Admin" : "-",
            tglVerifikasi: profiling.tanggal_diverifikasi ?? "-",
        };
    });
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const sel = rows.find((row) => row.id === selectedId) ?? null;
    return (
        <div>
            <style>{`
                .profiling-print-report { display: none; }
                @media print {
                    body * { visibility: hidden !important; }
                    .profiling-print-report,
                    .profiling-print-report * { visibility: visible !important; }
                    .profiling-print-report {
                        display: block !important;
                        position: fixed;
                        inset: 0;
                        padding: 32px;
                        background: white;
                        color: #111827;
                        font: 14px Arial, sans-serif;
                    }
                }
            `}</style>
            <PageHeader
                title="Riwayat Profiling"
                sub="Arsip profiling jaringan OPD beserta status dan catatan verifikasi Admin"
            />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2 space-y-3">
                    {rows.map((r) => (
                        <Card
                            key={r.id}
                            className={clx(
                                "p-4",
                                sel?.id === r.id
                                    ? "border-blue-500 ring-1 ring-blue-400 bg-blue-50/20"
                                    : "",
                            )}
                            onClick={() => setSelectedId(r.id)}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="font-bold text-slate-800">
                                        {r.periode}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {r.isp} · {r.bandwidth}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    {statusBadge(r.status)}
                                    {r.kondisi !== "-" &&
                                        statusBadge(r.kondisi)}
                                </div>
                            </div>
                            {r.status !== "Dikembalikan" && (
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-slate-500">
                                        <Download
                                            size={14}
                                            className="inline text-blue-500"
                                        />{" "}
                                        <strong>{r.dl}</strong> Mbps
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        <Upload
                                            size={14}
                                            className="inline text-blue-500"
                                        />{" "}
                                        <strong>{r.ul}</strong> Mbps
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        <Activity
                                            size={14}
                                            className="inline text-amber-500"
                                        />{" "}
                                        <strong>{r.ping}</strong>
                                        {typeof r.ping === "number" ? "ms" : ""}
                                    </span>
                                </div>
                            )}
                        </Card>
                    ))}
                    {rows.length === 0 && (
                        <Card className="p-6 text-center text-sm text-slate-500">
                            Belum ada data profiling tersimpan.
                        </Card>
                    )}
                </div>
                <div className="lg:col-span-3">
                    {sel ? (
                        <Card className="p-6 sticky top-4 space-y-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-extrabold text-slate-800 text-lg">
                                        Profiling {sel.periode}
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Diverifikasi: {sel.verifikator} ·{" "}
                                        {sel.tglVerifikasi}
                                    </p>
                                </div>
                                {statusBadge(sel.status)}
                            </div>

                            {sel.status === "Dikembalikan" ? (
                                <InfoBox type="error">
                                    <p className="font-semibold mb-1">
                                        Profiling Ditolak
                                    </p>
                                    <p>{sel.catatan}</p>
                                </InfoBox>
                            ) : (
                                <InfoBox
                                    type={
                                        sel.kondisi === "Baik"
                                            ? "success"
                                            : "warn"
                                    }
                                >
                                    <p className="font-semibold mb-1">
                                        Kesimpulan Admin: Kondisi {sel.kondisi}
                                    </p>
                                    <p>{sel.catatan}</p>
                                </InfoBox>
                            )}

                            {sel.status !== "Dikembalikan" && (
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                                        <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                                            <Download size={14} /> Download
                                        </p>
                                        <p className="font-bold text-slate-800 text-lg mt-0.5">
                                            {sel.dl} Mbps
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                                        <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                                            <Upload size={14} /> Upload
                                        </p>
                                        <p className="font-bold text-slate-800 text-lg mt-0.5">
                                            {sel.ul} Mbps
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                                        <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                                            <Activity size={14} /> Ping
                                        </p>
                                        <p className="font-bold text-slate-800 text-lg mt-0.5">
                                            {typeof sel.ping === "number"
                                                ? `${sel.ping} ms`
                                                : "-"}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                {[
                                    ["Bandwidth", sel.bandwidth],
                                    ["Jumlah Device", String(sel.device)],
                                    ["ISP", sel.isp],
                                    ["Aplikasi", sel.apps.join(", ")],
                                    ["Kendala", sel.kendala],
                                ].map(([k, v]) => (
                                    <div
                                        key={k}
                                        className="flex gap-3 py-2 border-b border-slate-100 last:border-0"
                                    >
                                        <span className="w-28 text-xs text-slate-400 font-semibold flex-shrink-0">
                                            {k}
                                        </span>
                                        <span className="text-sm text-slate-700">
                                            {v}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Btn
                                    variant="secondary"
                                    small
                                    onClick={() => window.print()}
                                >
                                    <FileDown size={15} /> Unduh PDF
                                </Btn>
                                {sel.status === "Dikembalikan" && (
                                    <Btn
                                        small
                                        onClick={() => onContinue(sel.id)}
                                    >
                                        <FilePenLine size={15} /> Isi Ulang
                                    </Btn>
                                )}
                                {sel.status === "Draft" && (
                                    <Btn
                                        small
                                        onClick={() => onContinue(sel.id)}
                                    >
                                        <FilePenLine size={15} /> Lanjutkan
                                    </Btn>
                                )}
                            </div>
                        </Card>
                    ) : (
                        <Card className="p-12 flex flex-col items-center justify-center text-center h-64">
                            <FolderClock
                                size={32}
                                className="mb-3 text-slate-400"
                                aria-hidden="true"
                            />
                            <p className="font-semibold text-slate-600">
                                Pilih periode profiling
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                                Klik dari daftar untuk melihat detail dan
                                catatan verifikasi
                            </p>
                        </Card>
                    )}
                </div>
            </div>
            {sel && (
                <section className="profiling-print-report">
                    <h1 style={{ fontSize: 24, fontWeight: 700 }}>
                        Riwayat Profiling Jaringan
                    </h1>
                    <h2 style={{ marginTop: 20, fontSize: 18 }}>
                        Periode {sel.periode}
                    </h2>
                    <p style={{ marginTop: 8 }}>
                        Status: {sel.status}
                        {sel.kondisi !== "-" ? ` · Kondisi: ${sel.kondisi}` : ""}
                    </p>
                    <p style={{ marginTop: 8 }}>
                        Diverifikasi oleh {sel.verifikator} pada {sel.tglVerifikasi}
                    </p>
                    <hr style={{ margin: "20px 0" }} />
                    <p>Bandwidth: {sel.bandwidth}</p>
                    <p>Jumlah device: {sel.device}</p>
                    <p>ISP: {sel.isp}</p>
                    <p>Aplikasi: {sel.apps.join(", ")}</p>
                    <p>Kendala: {sel.kendala}</p>
                    {sel.status !== "Dikembalikan" && (
                        <p>
                            Speed test: Download {sel.dl} Mbps · Upload {sel.ul} Mbps · Ping {sel.ping} ms
                        </p>
                    )}
                    <p style={{ marginTop: 16 }}>Catatan verifikasi: {sel.catatan}</p>
                </section>
            )}
        </div>
    );
}

// ─── Verifikasi Profiling ─────────────────────────────────────────────────────
function VerifikasiProfiling({
    queue,
    onResolved,
}: {
    queue: ProfilingQueueItem[];
    onResolved: (id: number, status: string, kesimpulan: string) => void;
}) {
    const [sel, setSel] = useState<ProfilingQueueItem | null>(null);
    const [resolvedProfilings, setResolvedProfilings] = useState<
        Record<number, "approved" | "rejected">
    >({});
    const [statusFilter, setStatusFilter] = useState("Semua Status");
    const [monthFilter, setMonthFilter] = useState("Semua Bulan");
    const [kesimpulan, setKesimpulan] = useState("");
    const [kondisiVerif, setKondisiVerif] = useState("Baik");
    const [kewajaranOk, setKewajaranOk] = useState<boolean | null>(null);
    const [kewajaranNote, setKewajaranNote] = useState("");
    const [decisionModal, setDecisionModal] = useState<
        "approve" | "reject" | null
    >(null);
    const [catatanTolak, setCatatanTolak] = useState("");
    const [done, setDone] = useState<"approved" | "rejected" | null>(null);
    const [requestError, setRequestError] = useState("");

    const contractedBandwidth = sel ? parseInt(sel.bandwidth) : 0;
    const pct =
        sel && contractedBandwidth > 0
            ? Math.round((sel.dl / contractedBandwidth) * 100)
            : 0;
    const wajar = pct >= 60;
    const canSubmit = kesimpulan.trim().length >= 10 && kewajaranOk !== null;
    const resolveProfiling = async (decision: "approved" | "rejected") => {
        if (!sel) return;
        setRequestError("");
        try {
            const approved = decision === "approved";
            const url = route(
                approved ? "profiling.verify" : "profiling.return",
                { profiling: sel.id },
            );
            await axios.post(
                url,
                approved
                    ? { kesimpulan }
                    : { catatan: catatanTolak },
                { headers: { Accept: "application/json" } },
            );
            setResolvedProfilings((current) => ({
                ...current,
                [sel.id]: decision,
            }));
            onResolved(
                sel.id,
                approved ? "diverifikasi" : "dikembalikan",
                approved ? kesimpulan : catatanTolak,
            );
            setDecisionModal(null);
            setDone(decision);
            setSel(null);
        } catch (error) {
            setRequestError(
                axios.isAxiosError(error)
                    ? error.response?.data?.message ??
                          "Keputusan gagal disimpan ke server."
                    : "Terjadi kesalahan saat menyimpan keputusan.",
            );
        }
    };
    const filteredProfilings = queue.filter((profiling) => {
        const month = Number(profiling.diajukan.slice(5, 7));
        const matchesStatus =
            statusFilter === "Semua Status" ||
            profiling.status === statusFilter;
        const monthNumberByLabel: Record<string, number> = {
            "Sep 2026": 9,
            "Ags 2026": 8,
        };
        const matchesMonth =
            monthFilter === "Semua Bulan" ||
            month === monthNumberByLabel[monthFilter];
        return (
            !resolvedProfilings[profiling.id] && matchesStatus && matchesMonth
        );
    });

    return (
        <div>
            <PageHeader
                title="Verifikasi Profiling"
                sub="Tinjau pengajuan profiling OPD, periksa kewajaran data, lalu buat keputusan"
            />
            {done && (
                <div className="mb-4">
                    <InfoBox type={done === "approved" ? "success" : "error"}>
                        {done === "approved" ? (
                            <>
                                <CircleCheck
                                    size={16}
                                    className="mr-1 inline"
                                />{" "}
                                Profiling berhasil disetujui dan tersimpan ke
                                riwayat OPD.
                            </>
                        ) : (
                            "✕ Profiling ditolak. OPD mendapat notifikasi untuk perbaikan."
                        )}
                    </InfoBox>
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2 space-y-3">
                    <div className="flex gap-2">
                        <FSelect
                            options={["Semua Status", "Diajukan"]}
                            value={statusFilter}
                            onChange={setStatusFilter}
                        />
                        <FSelect
                            options={["Semua Bulan", "Sep 2026", "Ags 2026"]}
                            value={monthFilter}
                            onChange={setMonthFilter}
                        />
                    </div>
                    {filteredProfilings.map((p) => (
                        <Card
                            key={p.id}
                            className={clx(
                                "p-4",
                                sel?.id === p.id
                                    ? "border-blue-500 ring-1 ring-blue-400"
                                    : "",
                            )}
                            onClick={() => {
                                setSel(p);
                                setKesimpulan("");
                                setKewajaranOk(null);
                                setDone(null);
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    {p.opd[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-semibold text-slate-800 text-sm truncate">
                                            {p.opd}
                                        </p>
                                        {statusBadge(p.status)}
                                    </div>
                                    <p className="text-xs text-slate-400">
                                        {p.diajukan}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {p.bandwidth} · {p.device} device · DL:{" "}
                                        {p.dl} Mbps
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {filteredProfilings.length === 0 && (
                        <Card className="p-6 text-center text-sm text-slate-500">
                            Belum ada pengajuan profiling untuk diverifikasi.
                        </Card>
                    )}
                </div>

                <div className="lg:col-span-3">
                    {requestError && (
                        <div className="mb-4">
                            <InfoBox type="error">{requestError}</InfoBox>
                        </div>
                    )}
                    {sel ? (
                        <Card className="p-6 space-y-5 sticky top-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-extrabold text-slate-800 text-lg">
                                        {sel.opd}
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Diajukan {sel.diajukan}
                                    </p>
                                </div>
                                {statusBadge(sel.status)}
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    [
                                        <>
                                            <Download size={14} /> DL
                                        </>,
                                        `${sel.dl} Mbps`,
                                    ],
                                    [
                                        <>
                                            <Upload size={14} /> UL
                                        </>,
                                        `${sel.ul} Mbps`,
                                    ],
                                    [
                                        <>
                                            <Activity size={14} /> Ping
                                        </>,
                                        `${sel.ping}ms`,
                                    ],
                                ].map(([l, v]) => (
                                    <div
                                        key={String(v)}
                                        className="bg-slate-50 rounded-xl p-3 text-center"
                                    >
                                        <p className="text-xs text-slate-400">
                                            {l}
                                        </p>
                                        <p className="font-bold text-slate-800">
                                            {v}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                {[
                                    ["ISP", sel.isp],
                                    ["Bandwidth", sel.bandwidth],
                                    ["Device", String(sel.device)],
                                    ["Aplikasi", sel.apps.join(", ")],
                                    ["Kendala", sel.kendala.join(", ")],
                                    ["Catatan OPD", sel.catatan],
                                ].map(([k, v]) => (
                                    <div
                                        key={k}
                                        className="flex gap-3 py-1.5 border-b border-slate-200 last:border-0"
                                    >
                                        <span className="w-24 text-xs text-slate-400 font-semibold flex-shrink-0">
                                            {k}
                                        </span>
                                        <span className="text-sm text-slate-700">
                                            {v}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Kewajaran */}
                            <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                                <p className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                                    <Activity
                                        size={16}
                                        className="text-blue-600"
                                    />{" "}
                                    Pemeriksaan Kewajaran Data
                                </p>
                                <div
                                    className={clx(
                                        "flex items-start gap-3 p-3 rounded-xl",
                                        wajar
                                            ? "bg-green-50 border border-green-200"
                                            : "bg-amber-50 border border-amber-200",
                                    )}
                                >
                                    <span
                                        className={clx(
                                            "mt-0.5",
                                            wajar
                                                ? "text-emerald-600"
                                                : "text-amber-600",
                                        )}
                                    >
                                        {wajar ? (
                                            <CircleCheck size={18} />
                                        ) : (
                                            <AlertTriangle size={18} />
                                        )}
                                    </span>
                                    <div>
                                        <p
                                            className={clx(
                                                "text-sm font-semibold",
                                                wajar
                                                    ? "text-green-700"
                                                    : "text-amber-700",
                                            )}
                                        >
                                            Speed aktual: {sel.dl} Mbps dari{" "}
                                            {sel.bandwidth} = {pct}%
                                        </p>
                                        <p
                                            className={clx(
                                                "text-xs mt-0.5",
                                                wajar
                                                    ? "text-green-600"
                                                    : "text-amber-600",
                                            )}
                                        >
                                            {wajar
                                                ? "Wajar — kecepatan ≥60% bandwidth berlangganan."
                                                : "Rendah — <60% bandwidth. Mungkin ada kendala teknis atau data kurang akurat."}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 font-semibold">
                                    Apakah data ini wajar dan dapat dipercaya?
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setKewajaranOk(true)}
                                        className={clx(
                                            "flex flex-1 items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer",
                                            kewajaranOk === true
                                                ? "border-green-500 bg-green-50 text-green-700"
                                                : "border-slate-200 hover:border-green-300 text-slate-500",
                                        )}
                                    >
                                        <CircleCheck
                                            size={16}
                                            aria-hidden="true"
                                        />{" "}
                                        Data Wajar
                                    </button>
                                    <button
                                        onClick={() => setKewajaranOk(false)}
                                        className={clx(
                                            "flex flex-1 items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer",
                                            kewajaranOk === false
                                                ? "border-red-400 bg-red-50 text-red-700"
                                                : "border-slate-200 hover:border-red-300 text-slate-500",
                                        )}
                                    >
                                        <AlertTriangle
                                            size={16}
                                            aria-hidden="true"
                                        />{" "}
                                        Meragukan
                                    </button>
                                </div>
                                {kewajaranOk === false && (
                                    <FTextarea
                                        placeholder="Jelaskan alasan data dianggap meragukan..."
                                        value={kewajaranNote}
                                        onChange={setKewajaranNote}
                                        rows={2}
                                    />
                                )}
                            </div>

                            <FTextarea
                                label="Kesimpulan Kondisi Jaringan"
                                required
                                hint="Min. 10 karakter. Analisis kondisi berdasarkan data profiling."
                                placeholder="Contoh: Jaringan dalam kondisi sedang. Kecepatan aktual 61% bandwidth. Disarankan koordinasi dengan ISP untuk peningkatan performa..."
                                value={kesimpulan}
                                onChange={setKesimpulan}
                                rows={4}
                            />

                            <FSelect
                                label="Penilaian Kondisi (untuk rekap laporan)"
                                options={["Baik", "Sedang", "Buruk"]}
                                value={kondisiVerif}
                                onChange={setKondisiVerif}
                            />

                            {!canSubmit && (
                                <InfoBox type="warn">
                                    Lengkapi kesimpulan (min. 10 karakter) dan
                                    pilih penilaian kewajaran data sebelum
                                    membuat keputusan.
                                </InfoBox>
                            )}

                            <div className="flex gap-3 flex-wrap">
                                <Btn
                                    disabled={!canSubmit}
                                    onClick={() => setDecisionModal("approve")}
                                >
                                    <CircleCheck size={16} /> Setujui Profiling
                                </Btn>
                                <Btn
                                    variant="danger"
                                    disabled={!canSubmit}
                                    onClick={() => setDecisionModal("reject")}
                                >
                                    ✕ Tolak & Minta Perbaikan
                                </Btn>
                            </div>
                        </Card>
                    ) : (
                        <Card className="p-12 flex flex-col items-center justify-center text-center h-64">
                            <ClipboardCheck
                                size={32}
                                className="mb-3 text-slate-400"
                            />
                            <p className="font-semibold text-slate-600">
                                Pilih profiling untuk ditinjau
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                                Klik dari antrean di kiri untuk memulai
                                verifikasi
                            </p>
                        </Card>
                    )}
                </div>
            </div>

            {decisionModal === "approve" && (
                <Modal
                    title="Konfirmasi Persetujuan"
                    onClose={() => setDecisionModal(null)}
                >
                    <div className="p-6 space-y-4">
                        <InfoBox type="success">
                            Profiling akan disetujui. Status OPD berubah ke{" "}
                            <strong>Diverifikasi</strong> dan data masuk rekap
                            laporan.
                        </InfoBox>
                        <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 space-y-1">
                            <p className="font-semibold mb-2">
                                Ringkasan Keputusan:
                            </p>
                            <p>
                                · Kondisi: <strong>{kondisiVerif}</strong>
                            </p>
                            <p>
                                · Kewajaran:{" "}
                                <strong>
                                    {kewajaranOk
                                        ? "Data Wajar"
                                        : "Data Meragukan"}
                                </strong>
                            </p>
                            <p>· Kesimpulan: {kesimpulan}</p>
                        </div>
                    </div>
                    <div className="px-6 pb-6 flex gap-3">
                        <Btn
                            variant="success"
                            onClick={() => resolveProfiling("approved")}
                        >
                            Konfirmasi Setujui
                        </Btn>
                        <Btn
                            variant="secondary"
                            onClick={() => setDecisionModal(null)}
                        >
                            Batal
                        </Btn>
                    </div>
                </Modal>
            )}
            {decisionModal === "reject" && (
                <Modal
                    title="Tolak Profiling"
                    onClose={() => setDecisionModal(null)}
                >
                    <div className="p-6 space-y-4">
                        <InfoBox type="error">
                            Status kembali ke <strong>Draft</strong>. OPD
                            mendapat notifikasi dan catatan perbaikan.
                        </InfoBox>
                        <FTextarea
                            label="Catatan Perbaikan untuk OPD"
                            required
                            rows={4}
                            placeholder="Jelaskan apa yang perlu diperbaiki. Contoh: Data speed test tidak lengkap, mohon sertakan screenshot pengukuran..."
                            value={catatanTolak}
                            onChange={setCatatanTolak}
                        />
                    </div>
                    <div className="px-6 pb-6 flex gap-3">
                        <Btn
                            variant="danger"
                            disabled={!catatanTolak.trim()}
                            onClick={() => resolveProfiling("rejected")}
                        >
                            Kirim Penolakan
                        </Btn>
                        <Btn
                            variant="secondary"
                            onClick={() => setDecisionModal(null)}
                        >
                            Batal
                        </Btn>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ─── Kelola Tiket ─────────────────────────────────────────────────────────────
function KelolaTicket({
    tickets,
    vendors,
    onChanged,
    onVendorCreated,
}: {
    tickets: any[];
    vendors: VendorDashboardRecord[];
    onChanged: (ticket: any) => void;
    onVendorCreated: (vendor: VendorDashboardRecord) => void;
}) {
    const ticketRows = tickets.map((ticket) => ({
        databaseId: ticket.id,
        id: ticket.nomor_tiket,
        opd: ticket.kendala?.profiling?.opd?.nama_opd ?? "OPD",
        kendala: getProfilingIssueLabel(
            ticket.kendala ?? { jenis_kendala: "" },
        ),
        deskripsi: ticket.kendala?.deskripsi ?? "",
        status: {
            baru: "Baru",
            diteruskan: "Diteruskan",
            proses: "Proses",
            menunggu_verifikasi: "Menunggu Verifikasi",
            selesai: "Selesai",
            ditolak: "Ditolak",
        }[ticket.status] ?? ticket.status,
        tanggal: ticket.created_at?.slice(0, 10) ?? "",
        vendor: ticket.pihak_ketiga?.nama_vendor ?? null,
        vendorId: ticket.pihak_ketiga_id,
        prioritas:
            ticket.urgensi === "tinggi"
                ? "Tinggi"
                : ticket.urgensi === "rendah"
                  ? "Rendah"
                  : "Sedang",
        histori: (ticket.riwayat ?? []).map((history: any) => ({
            tgl: history.tanggal?.slice(0, 10) ?? "",
            ev: history.catatan,
            aktor: history.user?.nama ?? "Pengguna",
        })),
    }));
    const mapTicket = (ticket: any) => ({
        databaseId: ticket.id,
        id: ticket.nomor_tiket,
        opd: ticket.kendala?.profiling?.opd?.nama_opd ?? "OPD",
        kendala: getProfilingIssueLabel(
            ticket.kendala ?? { jenis_kendala: "" },
        ),
        deskripsi: ticket.kendala?.deskripsi ?? "",
        status:
            {
                baru: "Baru",
                diteruskan: "Diteruskan",
                proses: "Proses",
                menunggu_verifikasi: "Menunggu Verifikasi",
                selesai: "Selesai",
                ditolak: "Ditolak",
            }[ticket.status] ?? ticket.status,
        tanggal: ticket.created_at?.slice(0, 10) ?? "",
        vendor: ticket.pihak_ketiga?.nama_vendor ?? null,
        vendorId: ticket.pihak_ketiga_id,
        prioritas:
            ticket.urgensi === "tinggi"
                ? "Tinggi"
                : ticket.urgensi === "rendah"
                  ? "Rendah"
                  : "Sedang",
        histori: (ticket.riwayat ?? []).map((history: any) => ({
                tgl: history.tanggal?.slice(0, 10) ?? "",
                ev: history.catatan,
                aktor: history.user?.nama ?? "Pengguna",
            })),
    });
    const [sel, setSel] = useState<(typeof ticketRows)[number] | null>(null);
    const [filter, setFilter] = useState("Semua Status");
    const [opdFilter, setOpdFilter] = useState("Semua OPD");
    const [action, setAction] = useState<"internal" | "teruskan" | null>(null);
    const [vendor, setVendor] = useState(vendors[0]?.nama_vendor ?? "");
    const [actionDone, setActionDone] = useState(false);
    const [actionError, setActionError] = useState("");
    const [saving, setSaving] = useState(false);
    const [vendorModal, setVendorModal] = useState(false);
    const [vendorForm, setVendorForm] = useState({
        nama_vendor: "",
        jenis_layanan: "lainnya",
        kontak_person: "",
        nomor_kontak: "",
    });
    const [vendorError, setVendorError] = useState("");
    const [vendorSaving, setVendorSaving] = useState(false);

    const filtered = ticketRows.filter(
        (t) =>
            (filter === "Semua Status" || t.status === filter) &&
            (opdFilter === "Semua OPD" || t.opd === opdFilter),
    );
    const submitForward = async () => {
        if (!sel || !action) return;
        setActionError("");
        setSaving(true);
        try {
            const selectedVendor = vendors.find(
                (item) => item.nama_vendor === vendor,
            );
            const response = await axios.post(
                route("tiket.forward", { tiket: sel.databaseId }),
                {
                    ditangani_internal: action === "internal",
                    pihak_ketiga_id:
                        action === "teruskan" ? selectedVendor?.id : null,
                },
                { headers: { Accept: "application/json" } },
            );
            const updatedTicket = response.data.ticket;
            onChanged(updatedTicket);
            setSel(mapTicket(updatedTicket));
            setActionDone(true);
        } catch (error) {
            setActionError(
                axios.isAxiosError(error)
                    ? error.response?.data?.message ??
                          "Tiket gagal diperbarui. Silakan coba lagi."
                    : "Terjadi kesalahan saat meneruskan tiket.",
            );
        } finally {
            setSaving(false);
        }
    };
    const createVendor = async () => {
        setVendorError("");
        setVendorSaving(true);
        try {
            const response = await axios.post(
                route("pihak-ketiga.store"),
                vendorForm,
                { headers: { Accept: "application/json" } },
            );
            const savedVendor = response.data.vendor as VendorDashboardRecord;
            onVendorCreated(savedVendor);
            setVendor(savedVendor.nama_vendor);
            setVendorForm({
                nama_vendor: "",
                jenis_layanan: "lainnya",
                kontak_person: "",
                nomor_kontak: "",
            });
            setVendorModal(false);
        } catch (error) {
            setVendorError(
                axios.isAxiosError(error)
                    ? error.response?.data?.errors?.nama_vendor?.[0] ??
                          error.response?.data?.message ??
                          "Vendor gagal ditambahkan."
                    : "Terjadi kesalahan saat menambahkan vendor.",
            );
        } finally {
            setVendorSaving(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="Kelola Tiket Pengaduan"
                sub="Tinjau tiket masuk dan tentukan penanganan: internal Diskominfo atau diteruskan ke vendor"
                action={
                    <Btn variant="secondary" onClick={() => setVendorModal(true)}>
                        <Users size={15} /> Tambah Vendor
                    </Btn>
                }
            />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <FSelect
                            options={[
                                "Semua Status",
                                "Baru",
                                "Diteruskan",
                                "Proses",
                                "Menunggu Verifikasi",
                                "Selesai",
                                "Ditolak",
                            ]}
                            value={filter}
                            onChange={(value) => {
                                setFilter(value);
                                setSel(null);
                            }}
                        />
                        <FSelect
                            options={[
                                "Semua OPD",
                                ...Array.from(
                                    new Set(
                                        ticketRows.map((ticket) => ticket.opd),
                                    ),
                                ),
                            ]}
                            value={opdFilter}
                            onChange={(value) => {
                                setOpdFilter(value);
                                setSel(null);
                            }}
                        />
                    </div>
                    {filtered.map((t) => (
                        <Card
                            key={t.id}
                            className={clx(
                                "p-4",
                                sel?.id === t.id
                                    ? "border-blue-500 ring-1 ring-blue-400"
                                    : "",
                            )}
                            onClick={() => {
                                setSel(t);
                                setAction(null);
                                setActionDone(false);
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={clx(
                                        "w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0",
                                        {
                                            Baru: "bg-sky-500",
                                            Proses: "bg-amber-400",
                                            Selesai: "bg-green-500",
                                            Diteruskan: "bg-purple-500",
                                        }[t.status] ?? "bg-slate-400",
                                    )}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-mono text-xs text-slate-400">
                                            {t.id}
                                        </span>
                                        {statusBadge(t.status)}
                                    </div>
                                    <p className="font-semibold text-slate-800 text-sm">
                                        {t.kendala}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {t.opd} · {t.tanggal}
                                    </p>
                                    <div className="mt-1.5">
                                        <Badge
                                            label={t.prioritas}
                                            color={
                                                t.prioritas === "Tinggi"
                                                    ? "red"
                                                    : t.prioritas === "Sedang"
                                                      ? "yellow"
                                                      : "gray"
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {filtered.length === 0 && (
                        <p className="px-3 py-8 text-center text-sm text-slate-400">
                            {ticketRows.length === 0
                                ? "Belum ada tiket di database."
                                : "Tidak ada tiket yang sesuai dengan filter."}
                        </p>
                    )}
                </div>

                <div className="lg:col-span-3">
                    {sel ? (
                        <Card className="p-6 space-y-5 sticky top-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <span className="font-mono text-xs text-slate-400">
                                        {sel.id}
                                    </span>
                                    <h3 className="font-extrabold text-slate-800 text-lg mt-0.5">
                                        {sel.kendala}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        {sel.opd} · Dilaporkan {sel.tanggal}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    {statusBadge(sel.status)}
                                    <Badge
                                        label={sel.prioritas}
                                        color={
                                            sel.prioritas === "Tinggi"
                                                ? "red"
                                                : "yellow"
                                        }
                                    />
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-xs text-slate-400 font-semibold mb-1">
                                    Deskripsi Kendala
                                </p>
                                <p className="text-sm text-slate-700">
                                    {sel.deskripsi}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-semibold mb-3 uppercase tracking-wide">
                                    Histori Tiket
                                </p>
                                {sel.histori.map((h, i) => (
                                    <TimelineItem
                                        key={i}
                                        date={h.tgl}
                                        event={h.ev}
                                        actor={h.aktor}
                                        last={i === sel.histori.length - 1}
                                        color={
                                            i === sel.histori.length - 1
                                                ? "blue"
                                                : "green"
                                        }
                                    />
                                ))}
                            </div>

                            {sel.status === "Baru" && !actionDone && (
                                <div className="border border-slate-200 rounded-2xl p-4 space-y-4">
                                    <div>
                                        <p className="flex items-center gap-2 font-bold text-slate-700 text-sm mb-1">
                                            <ClipboardCheck size={16} />
                                            Tentukan Tindak Lanjut
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            Pilih cara penanganan tiket.
                                            Keputusan mengubah status dan
                                            memberi notifikasi kepada pihak
                                            terkait.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() =>
                                                setAction("internal")
                                            }
                                            className={clx(
                                                "p-4 rounded-xl border-2 text-left cursor-pointer transition-all",
                                                action === "internal"
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-slate-200 hover:border-blue-300",
                                            )}
                                        >
                                            <div className="mb-2 text-blue-700">
                                                <Building2 size={24} />
                                            </div>
                                            <p className="font-semibold text-sm text-slate-800">
                                                Tangani Internal
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Oleh tim teknis Diskominfo,
                                                tanpa vendor
                                            </p>
                                        </button>
                                        <button
                                            onClick={() =>
                                                setAction("teruskan")
                                            }
                                            className={clx(
                                                "p-4 rounded-xl border-2 text-left cursor-pointer transition-all",
                                                action === "teruskan"
                                                    ? "border-purple-500 bg-purple-50"
                                                    : "border-slate-200 hover:border-purple-300",
                                            )}
                                        >
                                            <div className="mb-2 text-purple-700">
                                                <ArrowRight size={24} />
                                            </div>
                                            <p className="font-semibold text-sm text-slate-800">
                                                Teruskan ke Vendor
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Delegasikan ke pihak ketiga
                                                berkompetensi
                                            </p>
                                        </button>
                                    </div>
                                    {action === "teruskan" && (
                                        vendors.length ? (
                                            <FSelect
                                                label="Pilih Vendor / Pihak Ketiga"
                                                options={vendors.map(
                                                    (item) => item.nama_vendor,
                                                )}
                                                value={vendor}
                                                onChange={setVendor}
                                                hint="Vendor dipilih akan mendapat notifikasi dan bisa menerima/menolak tiket"
                                            />
                                        ) : (
                                            <InfoBox type="error">
                                                Belum ada pihak ketiga/vendor
                                                terdaftar. Tambahkan vendor
                                                terlebih dahulu sebelum
                                                meneruskan tiket.
                                            </InfoBox>
                                        )
                                    )}
                                    {actionError && (
                                        <InfoBox type="error">
                                            {actionError}
                                        </InfoBox>
                                    )}
                                    {action && (
                                        <div className="flex gap-3 pt-2">
                                            <Btn
                                                disabled={
                                                    saving ||
                                                    (action === "teruskan" &&
                                                        !vendors.some(
                                                            (item) =>
                                                                item.nama_vendor ===
                                                                vendor,
                                                        ))
                                                }
                                                onClick={submitForward}
                                            >
                                                {saving
                                                    ? "Menyimpan..."
                                                    : action === "internal"
                                                      ? <><Building2 size={16} /> Tangani Internal</>
                                                      : <><ArrowRight size={16} /> Teruskan ke {vendor}</>}
                                            </Btn>
                                            <Btn
                                                variant="ghost"
                                                onClick={() => setAction(null)}
                                            >
                                                Batal
                                            </Btn>
                                        </div>
                                    )}
                                    {!action && (
                                        <InfoBox type="info">
                                            Pilih salah satu opsi di atas untuk
                                            menindaklanjuti tiket ini.
                                        </InfoBox>
                                    )}
                                </div>
                            )}
                            {actionDone && (
                                <InfoBox type="success">
                                    {action === "internal"
                                        ? <><Building2 size={16} className="mr-1 inline" /> Tiket ditangani secara internal oleh tim Diskominfo.</>
                                        : <><ArrowRight size={16} className="mr-1 inline" /> Tiket diteruskan ke {vendor}. Menunggu konfirmasi vendor.</>}
                                </InfoBox>
                            )}
                            {sel.vendor && sel.status !== "Baru" && (
                                <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-xl p-3">
                                    <span className="text-purple-500">↗</span>
                                    <p className="text-sm text-purple-700">
                                        Diteruskan ke{" "}
                                        <strong>{sel.vendor}</strong>
                                    </p>
                                </div>
                            )}
                        </Card>
                    ) : (
                        <Card className="p-12 flex flex-col items-center justify-center text-center h-64">
                            <Ticket size={32} className="mb-3 text-slate-400" />
                            <p className="font-semibold text-slate-600">
                                Pilih tiket untuk ditinjau
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                                Klik tiket dari daftar untuk melihat detail dan
                                mengambil tindakan
                            </p>
                        </Card>
                    )}
                </div>
            </div>
            {vendorModal && (
                <Modal
                    title="Tambah Vendor / Pihak Ketiga"
                    onClose={() => setVendorModal(false)}
                >
                    <div className="space-y-4 p-6">
                        <InfoBox type="info">
                            Data vendor disimpan sebagai pihak ketiga dan
                            langsung tersedia untuk penerusan tiket. Akun
                            login vendor dapat dibuat terpisah melalui Data
                            User.
                        </InfoBox>
                        {vendorError && (
                            <InfoBox type="error">{vendorError}</InfoBox>
                        )}
                        <FInput
                            label="Nama Vendor"
                            value={vendorForm.nama_vendor}
                            onChange={(value) =>
                                setVendorForm({
                                    ...vendorForm,
                                    nama_vendor: value,
                                })
                            }
                            required
                        />
                        <FSelect
                            label="Jenis Layanan"
                            options={["Lainnya", "ISP", "Perangkat"]}
                            value={
                                vendorForm.jenis_layanan === "isp"
                                    ? "ISP"
                                    : vendorForm.jenis_layanan === "perangkat"
                                      ? "Perangkat"
                                      : "Lainnya"
                            }
                            onChange={(value) =>
                                setVendorForm({
                                    ...vendorForm,
                                    jenis_layanan:
                                        value === "ISP"
                                            ? "isp"
                                            : value === "Perangkat"
                                              ? "perangkat"
                                              : "lainnya",
                                })
                            }
                        />
                        <FInput
                            label="Nama Kontak (opsional)"
                            value={vendorForm.kontak_person}
                            onChange={(value) =>
                                setVendorForm({
                                    ...vendorForm,
                                    kontak_person: value,
                                })
                            }
                        />
                        <FInput
                            label="Nomor Kontak (opsional)"
                            value={vendorForm.nomor_kontak}
                            onChange={(value) =>
                                setVendorForm({
                                    ...vendorForm,
                                    nomor_kontak: value,
                                })
                            }
                        />
                    </div>
                    <div className="flex gap-3 px-6 pb-6">
                        <Btn
                            disabled={
                                vendorSaving || !vendorForm.nama_vendor.trim()
                            }
                            onClick={createVendor}
                        >
                            <Save size={15} />{" "}
                            {vendorSaving ? "Menyimpan..." : "Simpan Vendor"}
                        </Btn>
                        <Btn
                            variant="secondary"
                            onClick={() => setVendorModal(false)}
                        >
                            Batal
                        </Btn>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ─── Laporan ──────────────────────────────────────────────────────────────────
function LaporanLegacy() {
    return (
        <div>
            <PageHeader
                title="Laporan Kondisi Jaringan"
                sub="Rekap dan ekspor data kondisi jaringan seluruh OPD"
                action={
                    <>
                        <Btn variant="secondary">
                            <FileSpreadsheet size={16} /> Excel
                        </Btn>
                        <Btn variant="secondary">
                            <FileDown size={16} /> PDF
                        </Btn>
                    </>
                }
            />
            <div className="flex gap-3 flex-wrap mb-6">
                <FSelect
                    options={["Sep 2026", "Ags 2026", "Q3 2026", "Tahun 2026"]}
                />
                <FSelect
                    options={[
                        "Semua OPD",
                        "Dinas Pendidikan",
                        "Dinas Kesehatan",
                        "Dinas PUPR",
                    ]}
                />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <StatCard
                    label="Total OPD"
                    value={32}
                    icon={<Building2 size={20} />}
                    color="blue"
                />
                <StatCard
                    label="Kondisi Baik"
                    value="68%"
                    icon={<CheckCircle2 size={20} />}
                    color="green"
                />
                <StatCard
                    label="Kondisi Sedang"
                    value="22%"
                    icon={<AlertTriangle size={20} />}
                    color="amber"
                />
                <StatCard
                    label="Kondisi Buruk"
                    value="10%"
                    icon={<XCircle size={20} />}
                    color="red"
                />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <Card className="p-5">
                    <h3 className="font-bold text-slate-700 mb-4 text-sm">
                        Kondisi Jaringan per OPD
                    </h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart
                            data={networkData}
                            layout="vertical"
                            barSize={13}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f1f5f9"
                                horizontal={false}
                            />
                            <XAxis
                                type="number"
                                tick={{ fontSize: 10, fill: "#94a3b8" }}
                            />
                            <YAxis
                                dataKey="opd"
                                type="category"
                                tick={{ fontSize: 10, fill: "#94a3b8" }}
                                width={70}
                            />
                            <Tooltip />
                            <Bar
                                dataKey="baik"
                                name="Baik"
                                fill="#22c55e"
                                radius={[0, 4, 4, 0]}
                            />
                            <Bar
                                dataKey="sedang"
                                name="Sedang"
                                fill="#f59e0b"
                                radius={[0, 4, 4, 0]}
                            />
                            <Bar
                                dataKey="buruk"
                                name="Buruk"
                                fill="#ef4444"
                                radius={[0, 4, 4, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card className="p-5">
                    <h3 className="font-bold text-slate-700 mb-4 text-sm">
                        Tren Tiket 6 Bulan
                    </h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={ticketTrend}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f1f5f9"
                            />
                            <XAxis
                                dataKey="bulan"
                                tick={{ fontSize: 10, fill: "#94a3b8" }}
                            />
                            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="baru"
                                name="Baru"
                                stroke="#3b82f6"
                                strokeWidth={2.5}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="selesai"
                                name="Selesai"
                                stroke="#22c55e"
                                strokeWidth={2.5}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </div>
            <Card>
                <div className="p-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-700 text-sm">
                        Rekap Detail Kondisi Jaringan OPD
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100">
                                {[
                                    "OPD",
                                    "Bandwidth",
                                    "Kondisi",
                                    "DL (Mbps)",
                                    "UL (Mbps)",
                                    "Tiket Aktif",
                                    "Status Profiling",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                [
                                    "Dinas Pendidikan",
                                    "100 Mbps",
                                    "Baik",
                                    87,
                                    34,
                                    0,
                                    "Diverifikasi",
                                ],
                                [
                                    "Dinas Kesehatan",
                                    "100 Mbps",
                                    "Sedang",
                                    61,
                                    28,
                                    1,
                                    "Diajukan",
                                ],
                                [
                                    "Dinas PUPR",
                                    "50 Mbps",
                                    "Buruk",
                                    12,
                                    5,
                                    2,
                                    "Diverifikasi",
                                ],
                                [
                                    "Dinas Perhubungan",
                                    "200 Mbps",
                                    "Baik",
                                    178,
                                    89,
                                    0,
                                    "Diverifikasi",
                                ],
                                [
                                    "BKD",
                                    "50 Mbps",
                                    "Sedang",
                                    38,
                                    19,
                                    1,
                                    "Diajukan",
                                ],
                            ].map(
                                ([
                                    nama,
                                    bw,
                                    kondisi,
                                    dl,
                                    ul,
                                    tiket,
                                    profiling,
                                ]) => (
                                    <tr
                                        key={String(nama)}
                                        className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors"
                                    >
                                        <td className="px-4 py-3.5 font-semibold text-slate-800">
                                            {nama}
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-500">
                                            {bw}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {statusBadge(String(kondisi))}
                                        </td>
                                        <td className="px-4 py-3.5 font-mono text-slate-700">
                                            {dl}
                                        </td>
                                        <td className="px-4 py-3.5 font-mono text-slate-700">
                                            {ul}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {tiket === 0 ? (
                                                <span className="text-slate-400">
                                                    —
                                                </span>
                                            ) : (
                                                <Badge
                                                    label={`${tiket} aktif`}
                                                    color="red"
                                                />
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {statusBadge(String(profiling))}
                                        </td>
                                    </tr>
                                ),
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

function Laporan() {
    const [year, setYear] = useState("2026");
    const [period, setPeriod] = useState("Semua Bulan");
    const [opd, setOpd] = useState("Semua OPD");
    const months = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
    ];
    const periods = ["Semua Bulan", ...months, "Q1", "Q2", "Q3", "Q4"];
    const periodMonths: Record<string, number[]> = {
        Q1: [1, 2, 3],
        Q2: [4, 5, 6],
        Q3: [7, 8, 9],
        Q4: [10, 11, 12],
    };
    const selectedMonths =
        periodMonths[period] ??
        (period === "Semua Bulan" ? null : [months.indexOf(period) + 1]);
    const filtered = reportRows.filter(
        (row) =>
            row.year === Number(year) &&
            (!selectedMonths || selectedMonths.includes(row.month)) &&
            (opd === "Semua OPD" || row.opd === opd),
    );
    const average = (key: "baik" | "sedang" | "buruk") =>
        filtered.length
            ? `${Math.round(filtered.reduce((total, row) => total + row[key], 0) / filtered.length)}%`
            : "0%";
    const exportRows = filtered.map(
        ({ opd: nama, bandwidth, kondisi, dl, ul, tiket, profiling }) => ({
            OPD: nama,
            Bandwidth: bandwidth,
            Kondisi: kondisi,
            "Download (Mbps)": dl,
            "Upload (Mbps)": ul,
            "Tiket Aktif": tiket,
            "Status Profiling": profiling,
        }),
    );
    const exportExcel = async () => {
        const { default: ExcelJS } = await import("exceljs");
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Rekap Jaringan");
        worksheet.columns = [
            { header: "OPD", key: "OPD", width: 30 },
            { header: "Bandwidth", key: "Bandwidth", width: 16 },
            { header: "Kondisi", key: "Kondisi", width: 16 },
            { header: "Download (Mbps)", key: "Download (Mbps)", width: 20 },
            { header: "Upload (Mbps)", key: "Upload (Mbps)", width: 18 },
            { header: "Tiket Aktif", key: "Tiket Aktif", width: 14 },
            { header: "Status Profiling", key: "Status Profiling", width: 20 },
        ];
        worksheet.addRows(exportRows);
        worksheet.getRow(1).font = { bold: true, color: { argb: "FF1E3A8A" } };
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Laporan-SIPROJAR-${year}-${period.replaceAll(" ", "-")}.xlsx`;
        link.click();
        URL.revokeObjectURL(url);
    };
    const exportPdf = () => {
        const popup = window.open("", "_blank");
        if (!popup) return;
        const cells = exportRows
            .map(
                (row) =>
                    `<tr>${Object.values(row)
                        .map((value) => `<td>${String(value)}</td>`)
                        .join("")}</tr>`,
            )
            .join("");
        popup.document.write(
            `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Laporan SIPROJAR</title><style>body{font:14px Arial,sans-serif;padding:32px;color:#0f172a}h1{color:#1e3a8a}table{border-collapse:collapse;width:100%;margin-top:24px}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}th{background:#eff6ff}@media print{body{padding:0}}</style></head><body><h1>Laporan Kondisi Jaringan SIPROJAR</h1><p>Tahun ${year} · ${period} · ${opd}</p><p>Total OPD: ${filtered.length} | Tiket aktif: ${filtered.reduce((total, row) => total + row.tiket, 0)}</p><table><thead><tr><th>OPD</th><th>Bandwidth</th><th>Kondisi</th><th>Download</th><th>Upload</th><th>Tiket Aktif</th><th>Status Profiling</th></tr></thead><tbody>${cells || "<tr><td colspan='7'>Tidak ada data pada filter ini</td></tr>"}</tbody></table><script>window.onload=()=>window.print()</script></body></html>`,
        );
        popup.document.close();
    };

    return (
        <div>
            <PageHeader
                title="Laporan Kondisi Jaringan"
                sub="Rekap kondisi jaringan sesuai tahun, periode, dan OPD yang dipilih"
                action={
                    <>
                        <Btn
                            variant="secondary"
                            className="shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                            onClick={exportExcel}
                        >
                            <FileSpreadsheet size={16} /> Excel
                        </Btn>
                        <Btn
                            variant="secondary"
                            className="shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                            onClick={exportPdf}
                        >
                            <FileDown size={16} /> PDF
                        </Btn>
                    </>
                }
            />
            <div className="mb-6 flex flex-wrap gap-3">
                <div className="min-w-32">
                    <FSelect
                        label="Tahun"
                        options={["2026", "2025", "2024"]}
                        value={year}
                        onChange={setYear}
                    />
                </div>
                <div className="min-w-44">
                    <FSelect
                        label="Periode / Bulan"
                        options={periods}
                        value={period}
                        onChange={setPeriod}
                    />
                </div>
                <div className="min-w-52">
                    <FSelect
                        label="OPD"
                        options={[
                            "Semua OPD",
                            ...reportRows.map((row) => row.opd),
                        ]}
                        value={opd}
                        onChange={setOpd}
                    />
                </div>
            </div>
            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard
                    label="OPD dalam filter"
                    value={filtered.length}
                    icon={<Building2 size={20} />}
                    color="blue"
                />
                <StatCard
                    label="Kondisi Baik"
                    value={average("baik")}
                    icon={<CheckCircle2 size={20} />}
                    color="green"
                />
                <StatCard
                    label="Kondisi Sedang"
                    value={average("sedang")}
                    icon={<AlertTriangle size={20} />}
                    color="amber"
                />
                <StatCard
                    label="Kondisi Buruk"
                    value={average("buruk")}
                    icon={<XCircle size={20} />}
                    color="red"
                />
            </div>
            {filtered.length === 0 ? (
                <Card className="p-10 text-center text-sm text-slate-500">
                    Tidak ada data untuk kombinasi filter yang dipilih.
                </Card>
            ) : (
                <>
                    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <Card className="p-5">
                            <h3 className="mb-4 text-sm font-bold text-slate-700">
                                Kondisi jaringan{" "}
                                {opd === "Semua OPD" ? "per OPD" : `- ${opd}`}
                            </h3>
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart
                                    data={filtered}
                                    layout="vertical"
                                    barSize={13}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f1f5f9"
                                        horizontal={false}
                                    />
                                    <XAxis
                                        type="number"
                                        domain={[0, 100]}
                                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                                    />
                                    <YAxis
                                        dataKey="opd"
                                        type="category"
                                        tick={{ fontSize: 10, fill: "#64748b" }}
                                        width={110}
                                    />
                                    <Tooltip />
                                    <Bar
                                        dataKey="baik"
                                        name="Baik (%)"
                                        stackId="condition"
                                        fill="#34d399"
                                    />
                                    <Bar
                                        dataKey="sedang"
                                        name="Sedang (%)"
                                        stackId="condition"
                                        fill="#fbbf24"
                                    />
                                    <Bar
                                        dataKey="buruk"
                                        name="Buruk (%)"
                                        stackId="condition"
                                        fill="#f87171"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                        <Card className="p-5">
                            <h3 className="mb-4 text-sm font-bold text-slate-700">
                                Tiket aktif{" "}
                                {opd === "Semua OPD" ? "per OPD" : `- ${opd}`}
                            </h3>
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={filtered}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f1f5f9"
                                    />
                                    <XAxis
                                        dataKey="opd"
                                        tick={{ fontSize: 10, fill: "#64748b" }}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                                    />
                                    <Tooltip />
                                    <Bar
                                        dataKey="tiket"
                                        name="Tiket aktif"
                                        fill="#60a5fa"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </div>
                    <Card>
                        <div className="border-b border-slate-100 p-4">
                            <h3 className="text-sm font-bold text-slate-700">
                                Rekap detail kondisi jaringan OPD
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        {[
                                            "OPD",
                                            "Bandwidth",
                                            "Kondisi",
                                            "DL (Mbps)",
                                            "UL (Mbps)",
                                            "Tiket Aktif",
                                            "Status Profiling",
                                        ].map((heading) => (
                                            <th
                                                key={heading}
                                                className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-400"
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((row) => (
                                        <tr
                                            key={row.opd}
                                            className="border-b border-slate-50 hover:bg-blue-50/30"
                                        >
                                            <td className="px-4 py-3.5 font-semibold text-slate-800">
                                                {row.opd}
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-500">
                                                {row.bandwidth}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {statusBadge(row.kondisi)}
                                            </td>
                                            <td className="px-4 py-3.5 font-mono">
                                                {row.dl}
                                            </td>
                                            <td className="px-4 py-3.5 font-mono">
                                                {row.ul}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {row.tiket ? (
                                                    <Badge
                                                        label={`${row.tiket} aktif`}
                                                        color="red"
                                                    />
                                                ) : (
                                                    "—"
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {statusBadge(row.profiling)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}

// ─── Dashboard OPD ────────────────────────────────────────────────────────────
function DashboardOPD({
    onNav,
    opdName,
}: {
    onNav: (s: Screen) => void;
    opdName?: string | null;
}) {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Dashboard OPD"
                sub={`${opdName ?? "OPD belum terhubung"} · Status jaringan dan pengaduan`}
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                    label="Status Profiling"
                    value="Diverifikasi"
                    icon={<CheckCircle2 size={20} />}
                    color="green"
                    sub="Sep 2026"
                />
                <StatCard
                    label="Kondisi Jaringan"
                    value="Baik"
                    icon={<Network size={20} />}
                    color="blue"
                />
                <StatCard
                    label="Tiket Aktif"
                    value={2}
                    icon={<Ticket size={20} />}
                    color="amber"
                />
                <StatCard
                    label="Tiket Selesai"
                    value={8}
                    icon="✓"
                    color="green"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-slate-700 text-sm">
                                Profiling Terkini
                            </h3>
                            <p className="text-xs text-slate-400">
                                3 periode terakhir
                            </p>
                        </div>
                        <Btn
                            variant="ghost"
                            small
                            onClick={() => onNav("riwayat-profiling")}
                        >
                            Lihat semua →
                        </Btn>
                    </div>
                    {riwayatProfiling.slice(0, 3).map((r) => (
                        <div
                            key={r.periode}
                            className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0"
                        >
                            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 text-xs font-bold flex-shrink-0">
                                {r.periode.split(" ")[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800">
                                    {r.periode}
                                </p>
                                <p className="text-xs text-slate-400">
                                    DL: {r.dl} Mbps · UL: {r.ul} Mbps
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                {statusBadge(r.status)}
                                {r.kondisi !== "-" && statusBadge(r.kondisi)}
                            </div>
                        </div>
                    ))}
                </Card>
                <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-slate-700 text-sm">
                                Tiket Pengaduan
                            </h3>
                            <p className="text-xs text-slate-400">
                                Pengaduan terbaru OPD
                            </p>
                        </div>
                        <Btn
                            variant="ghost"
                            small
                            onClick={() => onNav("pantau-tiket")}
                        >
                            Lihat semua →
                        </Btn>
                    </div>
                    {ticketList.slice(0, 3).map((t) => (
                        <div
                            key={t.id}
                            className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0"
                        >
                            <Dot
                                color={
                                    ({
                                        Baru: "blue",
                                        Proses: "yellow",
                                        Selesai: "green",
                                        Diteruskan: "gray",
                                    }[t.status] as
                                        | "blue"
                                        | "yellow"
                                        | "green"
                                        | "gray") ?? "gray"
                                }
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800">
                                    {t.kendala}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {t.tanggal}
                                </p>
                            </div>
                            {statusBadge(t.status)}
                        </div>
                    ))}
                </Card>
            </div>
            <div className="flex gap-3 flex-wrap">
                <Btn onClick={() => onNav("form-profiling")}>
                    <FilePenLine size={16} /> Isi Profiling
                </Btn>
                <Btn
                    variant="secondary"
                    onClick={() => onNav("riwayat-profiling")}
                >
                    <FolderClock size={16} /> Riwayat Profiling
                </Btn>
                <Btn
                    variant="secondary"
                    onClick={() => onNav("tiket-pengaduan")}
                >
                    <Ticket size={16} /> Ajukan Tiket
                </Btn>
                <Btn variant="secondary" onClick={() => onNav("pantau-tiket")}>
                    <SearchCheck size={16} /> Pantau Tiket
                </Btn>
            </div>
        </div>
    );
}

// ─── Tiket Pengaduan ──────────────────────────────────────────────────────────
function TiketPengaduan({
    onCreated,
    onNav,
    opdName,
    profilings,
}: {
    onCreated: (ticket: any) => void;
    onNav: (screen: Screen) => void;
    opdName?: string | null;
    profilings: ProfilingRecord[];
}) {
    const [step, setStep] = useState(0);
    const [selectedIssueId, setSelectedIssueId] = useState<number | null>(
        null,
    );
    const [done, setDone] = useState(false);
    const [ticketNumber, setTicketNumber] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const verifiedProfiling = profilings.find(
        (profiling) => profiling.status_verifikasi === "diverifikasi",
    );
    const reportedIssues = verifiedProfiling?.kendala ?? [];
    const selectedIssue =
        reportedIssues.find((issue) => issue.id === selectedIssueId) ?? null;
    const latestProfiling = profilings[0];
    const displayedProfiling = verifiedProfiling ?? profilings[0];
    const activeConnection = profilings
        .flatMap((profiling) => profiling.opd?.koneksi_internet ?? [])
        .find((connection) => connection.status === "aktif");
    const profilingPeriod = displayedProfiling
        ? new Intl.DateTimeFormat("id-ID", {
              month: "short",
              year: "numeric",
          }).format(new Date(`${displayedProfiling.periode}-01T00:00:00`))
        : null;

    if (!verifiedProfiling) {
        const needsEditing = ["draft", "dikembalikan"].includes(
            latestProfiling?.status_verifikasi ?? "",
        );
        const isWaitingForReview =
            latestProfiling?.status_verifikasi === "diajukan";

        return (
            <div>
                <PageHeader
                    title="Ajukan Tiket Pengaduan"
                    sub="Tiket pengaduan dapat diajukan setelah profiling OPD diverifikasi Admin"
                />
                <div className="max-w-2xl">
                    <Card className="p-5 sm:p-7">
                        <div className="mb-5">
                            <h3 className="font-bold text-slate-800 mb-1">
                                {isWaitingForReview
                                    ? "Profiling sedang menunggu verifikasi"
                                    : needsEditing
                                      ? "Profiling belum siap diajukan"
                                      : "Isi profiling terlebih dahulu"}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {isWaitingForReview
                                    ? `Profiling periode ${latestProfiling?.periode} sudah diajukan. Tunggu Admin memverifikasinya sebelum membuat tiket.`
                                    : latestProfiling?.status_verifikasi ===
                                        "dikembalikan"
                                      ? "Profiling dikembalikan oleh Admin dan perlu diperbaiki sebelum bisa digunakan untuk mengajukan tiket."
                                      : needsEditing
                                        ? "Profiling masih berupa draft. Lengkapi dan ajukan untuk verifikasi Admin."
                                        : "Belum ada profiling untuk akun OPD ini. Isi dan ajukan profiling, lalu tunggu verifikasi Admin."}
                            </p>
                        </div>
                        <InfoBox type="info">
                            Profiling mencatat kondisi jaringan OPD. Tiket
                            digunakan untuk melaporkan gangguan yang perlu
                            ditangani setelah kondisi jaringan tersebut
                            diverifikasi.
                        </InfoBox>
                        <div className="mt-5 flex gap-3 flex-wrap">
                            <Btn
                                onClick={() =>
                                    onNav(
                                        isWaitingForReview
                                            ? "riwayat-profiling"
                                            : "form-profiling",
                                    )
                                }
                            >
                                {isWaitingForReview
                                    ? "Lihat Riwayat Profiling"
                                    : needsEditing
                                      ? "Lanjutkan Profiling"
                                      : "Isi Profiling"}
                            </Btn>
                            {isWaitingForReview && (
                                <Btn
                                    variant="secondary"
                                    onClick={() => onNav("dashboard-opd")}
                                >
                                    Kembali ke Dashboard
                                </Btn>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    if (reportedIssues.length === 0) {
        return (
            <div>
                <PageHeader
                    title="Ajukan Tiket Pengaduan"
                    sub="Tiket dibuat berdasarkan kendala yang tercatat pada profiling"
                />
                <div className="max-w-2xl">
                    <Card className="p-5 sm:p-7">
                        <h3 className="font-bold text-slate-800 mb-1">
                            Belum ada kendala di profiling terverifikasi
                        </h3>
                        <p className="text-sm text-slate-500 mb-5">
                            Tiket hanya dapat diajukan untuk kendala yang sudah
                            dilaporkan dalam profiling. Profiling terverifikasi
                            periode {profilingPeriod} belum mencatat kendala.
                        </p>
                        <InfoBox type="info">
                            Jika ada kendala yang perlu ditangani, catat pada
                            profiling periode berikutnya dan ajukan untuk
                            diverifikasi Admin. Kendala itu akan tersedia di
                            sini setelah diverifikasi.
                        </InfoBox>
                        <div className="mt-5">
                            <Btn
                                onClick={() => onNav("form-profiling")}
                            >
                                Isi Profiling
                            </Btn>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    if (done)
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-4xl mb-5">
                    <Ticket size={20} />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800 mb-2">
                    Tiket Berhasil Diajukan!
                </h2>
                <p className="text-slate-500 max-w-sm mb-1">
                    Nomor tiket:{" "}
                    <strong className="text-blue-600">{ticketNumber}</strong>
                </p>
                <p className="text-slate-400 text-sm max-w-sm">
                    Admin Diskominfo akan segera menindaklanjuti. Pantau status
                    di menu Pantau Tiket.
                </p>
                <Btn
                    className="mt-8"
                    onClick={() => {
                        setDone(false);
                        setStep(0);
                        setSelectedIssueId(null);
                        setSubmitError("");
                    }}
                >
                    Ajukan Tiket Lain
                </Btn>
            </div>
        );

    return (
        <div>
            <PageHeader
                title="Ajukan Tiket Pengaduan"
                sub="Laporkan kendala jaringan kepada Admin Diskominfo untuk ditindaklanjuti"
            />
            <div className="max-w-2xl">
                <Card className="p-5 sm:p-7">
                    {step === 0 && (
                        <>
                            <h3 className="font-bold text-slate-800 mb-1">
                                Pilih Kendala dari Profiling
                            </h3>
                            <p className="text-sm text-slate-400 mb-5">
                                Pilih kendala yang sudah dilaporkan dan
                                diverifikasi pada profiling periode{" "}
                                {profilingPeriod}.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                                {reportedIssues.map((issue) => {
                                    const hasTicket = Boolean(issue.tiket);
                                    const icon =
                                        issue.jenis_kendala ===
                                        "bandwidth_kurang" ? (
                                            <Gauge size={24} />
                                        ) : issue.jenis_kendala === "device" ? (
                                            <HeartCrack size={24} />
                                        ) : issue.jenis_kendala === "topologi" ? (
                                            <Settings2 size={24} />
                                        ) : issue.jenis_kendala ===
                                          "sosialisasi" ? (
                                            <Activity size={24} />
                                        ) : (
                                            <Pin size={24} />
                                        );

                                    return (
                                        <button
                                            key={issue.id}
                                            disabled={hasTicket}
                                            onClick={() =>
                                                setSelectedIssueId(issue.id)
                                            }
                                            className={clx(
                                                "p-4 rounded-2xl border-2 text-left transition-all group",
                                                hasTicket
                                                    ? "border-slate-100 bg-slate-50 cursor-not-allowed opacity-70"
                                                    : "cursor-pointer hover:border-blue-300 hover:bg-blue-50/30",
                                                selectedIssueId === issue.id
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "",
                                            )}
                                        >
                                            <div className="text-2xl mb-2 transition-transform inline-block">
                                                {icon}
                                            </div>
                                            <p
                                                className={`font-semibold text-sm mb-0.5 ${
                                                    selectedIssueId === issue.id
                                                        ? "text-blue-700"
                                                        : "text-slate-800"
                                                }`}
                                            >
                                                {getProfilingIssueLabel(issue)}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {issue.deskripsi ||
                                                    "Tidak ada uraian kendala pada profiling."}
                                            </p>
                                            {hasTicket && (
                                                <p className="mt-2 text-xs font-semibold text-amber-700">
                                                    Sudah diajukan sebagai tiket{" "}
                                                    {issue.tiket?.nomor_tiket}
                                                </p>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            {reportedIssues.every((issue) => issue.tiket) && (
                                <div className="mb-5">
                                    <InfoBox type="info">
                                        Semua kendala pada profiling ini sudah
                                        memiliki tiket. Pantau tindak lanjutnya
                                        di menu Pantau Tiket.
                                    </InfoBox>
                                </div>
                            )}
                            <Btn
                                disabled={!selectedIssueId}
                                onClick={() => setStep(1)}
                            >
                                Lanjutkan →
                            </Btn>
                        </>
                    )}
                    {step === 1 && (
                        <>
                            <button
                                onClick={() => setStep(0)}
                                className="text-xs text-blue-500 hover:underline cursor-pointer mb-4 flex items-center gap-1"
                            >
                                ← Ganti jenis kendala
                            </button>
                            <div className="flex items-center gap-2 mb-5">
                                <Badge
                                    label={
                                        selectedIssue
                                            ? getProfilingIssueLabel(
                                                  selectedIssue,
                                              )
                                            : "Pilih kendala"
                                    }
                                    color="blue"
                                />
                            </div>
                            <h3 className="font-bold text-slate-800 mb-1">
                                Detail Pengaduan
                            </h3>
                            <p className="text-sm text-slate-400 mb-5">
                                Tiket ini menggunakan uraian kendala yang sudah
                                dicatat pada profiling.
                            </p>
                            <div className="bg-slate-50 rounded-xl p-4 mb-5 space-y-1">
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-2">
                                    Data Jaringan OPD
                                    {profilingPeriod
                                        ? ` (Profiling ${profilingPeriod})`
                                        : ""}
                                </p>
                                <p className="text-sm text-slate-600">
                                    OPD:{" "}
                                    <strong>
                                        {opdName ??
                                            "Akun belum terhubung ke OPD"}
                                    </strong>
                                </p>
                                <p className="text-sm text-slate-600">
                                    {activeConnection
                                        ? `ISP: ${activeConnection.nama_isp} · Bandwidth: ${activeConnection.bandwidth_mbps} Mbps`
                                        : "Koneksi: Belum ada data koneksi aktif"}
                                </p>
                                <p className="text-sm text-slate-600 pt-2">
                                    Kendala:{" "}
                                    <strong>
                                        {selectedIssue
                                            ? getProfilingIssueLabel(
                                                  selectedIssue,
                                              )
                                            : ""}
                                    </strong>
                                </p>
                                <p className="text-sm text-slate-600 whitespace-pre-wrap">
                                    {selectedIssue?.deskripsi ||
                                        "Tidak ada uraian kendala pada profiling."}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Btn
                                    disabled={!selectedIssue || submitting}
                                    onClick={async () => {
                                        setSubmitError("");
                                        setSubmitting(true);
                                        try {
                                            const response = await axios.post(
                                                route("tiket.store"),
                                                {
                                                    kendala_id:
                                                        selectedIssue?.id,
                                                    urgensi: "sedang",
                                                },
                                                {
                                                    headers: {
                                                        Accept: "application/json",
                                                    },
                                                },
                                            );
                                            setTicketNumber(
                                                response.data.ticket
                                                    .nomor_tiket,
                                            );
                                            onCreated(response.data.ticket);
                                            setDone(true);
                                        } catch (error) {
                                            if (axios.isAxiosError(error)) {
                                                setSubmitError(
                                                    error.response?.data
                                                        ?.message ??
                                                        "Tiket gagal disimpan. Periksa data dan coba lagi.",
                                                );
                                            } else {
                                                setSubmitError(
                                                    "Terjadi kesalahan saat mengajukan tiket.",
                                                );
                                            }
                                        } finally {
                                            setSubmitting(false);
                                        }
                                    }}
                                >
                                    <Ticket size={16} />{" "}
                                    {submitting
                                        ? "Menyimpan..."
                                        : "Ajukan Tiket"}
                                </Btn>
                                <Btn
                                    variant="secondary"
                                    onClick={() => setStep(0)}
                                >
                                    ← Kembali
                                </Btn>
                            </div>
                            {submitError && (
                                <div className="mt-4">
                                    <InfoBox type="error">
                                        {submitError}
                                    </InfoBox>
                                </div>
                            )}
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}

// ─── Pantau Tiket ─────────────────────────────────────────────────────────────
function PantauTiket({ tickets }: { tickets: any[] }) {
    const displayTickets = tickets.map((ticket) => {
        const kindLabels: Record<string, string> = {
            bandwidth_kurang: "Speed Lambat",
            device: "Perangkat Rusak",
            topologi: "Konfigurasi Jaringan",
            sosialisasi: "Lainnya",
        };
        const statusLabels: Record<string, string> = {
            baru: "Baru",
            diteruskan: "Diteruskan",
            proses: "Proses",
            menunggu_verifikasi: "Proses",
            selesai: "Selesai",
            ditolak: "Ditolak",
        };

        return {
            id: ticket.nomor_tiket,
            opd: ticket.kendala?.profiling?.opd?.nama_opd ?? "OPD",
            kendala:
                kindLabels[ticket.kendala?.jenis_kendala] ??
                ticket.kendala?.jenis_kendala ??
                "Kendala jaringan",
            deskripsi: ticket.kendala?.deskripsi ?? "-",
            status: statusLabels[ticket.status] ?? ticket.status,
            tanggal: ticket.created_at?.slice(0, 10) ?? "-",
            vendor: ticket.pihak_ketiga?.nama_vendor ?? null,
            prioritas: ticket.urgensi,
            histori: (ticket.riwayat ?? []).map((history: any) => ({
                tgl: history.tanggal?.slice(0, 10) ?? "-",
                ev: history.catatan,
                aktor: history.user?.nama ?? "Pengguna",
            })),
        };
    });
    const [sel, setSel] = useState<(typeof displayTickets)[number] | null>(
        displayTickets[0] ?? null,
    );
    useEffect(() => {
        setSel((current) =>
            displayTickets.find((ticket) => ticket.id === current?.id) ??
            displayTickets[0] ??
            null,
        );
    }, [tickets]);
    return (
        <div>
            <PageHeader
                title="Pantau Tiket & Status"
                sub="Monitor status pengaduan jaringan dan riwayat penanganan"
            />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2 space-y-3">
                    {displayTickets.length === 0 ? (
                        <Card className="p-6 text-center text-sm text-slate-400">
                            Belum ada tiket yang diajukan.
                        </Card>
                    ) : displayTickets.map((t) => (
                        <Card
                            key={t.id}
                            className={clx(
                                "p-4",
                                sel?.id === t.id
                                    ? "border-blue-500 ring-1 ring-blue-400"
                                    : "",
                            )}
                            onClick={() => setSel(t)}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={clx(
                                        "w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0",
                                        {
                                            Baru: "bg-sky-500",
                                            Proses: "bg-amber-400",
                                            Selesai: "bg-green-500",
                                            Diteruskan: "bg-purple-500",
                                        }[t.status] ?? "bg-slate-400",
                                    )}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-mono text-xs text-slate-400">
                                            {t.id}
                                        </span>
                                        {statusBadge(t.status)}
                                    </div>
                                    <p className="font-semibold text-slate-800 text-sm">
                                        {t.kendala}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {t.tanggal}
                                    </p>
                                    {t.vendor && (
                                        <p className="text-xs text-purple-500 mt-1">
                                            ↗ {t.vendor}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
                <div className="lg:col-span-3">
                    {sel ? (
                        <Card className="p-6 sticky top-4 space-y-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <span className="font-mono text-xs text-slate-400">
                                        {sel.id}
                                    </span>
                                    <h3 className="font-extrabold text-slate-800 text-lg mt-0.5">
                                        {sel.kendala}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        {sel.tanggal}
                                    </p>
                                </div>
                                {statusBadge(sel.status)}
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-xs text-slate-400 font-semibold mb-1">
                                    Deskripsi
                                </p>
                                <p className="text-sm text-slate-700">
                                    {sel.deskripsi}
                                </p>
                            </div>
                            {sel.vendor && (
                                <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-xl p-3">
                                    <span className="text-purple-500">↗</span>
                                    <p className="text-sm text-purple-700">
                                        Diteruskan ke{" "}
                                        <strong>{sel.vendor}</strong>
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-slate-400 font-semibold mb-3 uppercase tracking-wide">
                                    Riwayat Penanganan
                                </p>
                                {sel.histori.map((h, i) => (
                                    <TimelineItem
                                        key={i}
                                        date={h.tgl}
                                        event={h.ev}
                                        actor={h.aktor}
                                        last={i === sel.histori.length - 1}
                                        color={
                                            i === sel.histori.length - 1
                                                ? "blue"
                                                : "green"
                                        }
                                    />
                                ))}
                            </div>
                        </Card>
                    ) : (
                        <Card className="p-12 flex flex-col items-center justify-center text-center h-64">
                            <SearchCheck
                                size={32}
                                className="mb-3 text-slate-400"
                                aria-hidden="true"
                            />
                            <p className="font-semibold text-slate-600">
                                Pilih tiket untuk melihat detail
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                                Klik dari daftar untuk memantau status dan
                                riwayat penanganan
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Dashboard Vendor ─────────────────────────────────────────────────────────
function DashboardVendor({
    onNav,
    tickets,
    vendorName,
}: {
    onNav: (s: Screen) => void;
    tickets: VendorTicketRecord[];
    vendorName: string;
}) {
    const processing = tickets.filter((ticket) => ticket.status === "proses");
    const pending = tickets.filter(
        (ticket) =>
            ticket.status === "diteruskan" ||
            ticket.status === "menunggu_verifikasi",
    );
    return (
        <div className="space-y-6">
            <PageHeader
                title="Dashboard Vendor"
                sub={`${vendorName} · Ikhtisar penugasan tiket`}
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                    label="Total Ditugaskan"
                    value={tickets.length}
                    icon={<ClipboardList size={20} />}
                    color="blue"
                />
                <StatCard
                    label="Sedang Proses"
                    value={processing.length}
                    icon={<Wrench size={20} />}
                    color="amber"
                />
                <StatCard
                    label="Menunggu Respons / Verifikasi"
                    value={pending.length}
                    icon={<CheckCircle2 size={20} />}
                    color="green"
                />
                <StatCard
                    label="Selesai"
                    value={tickets.filter((t) => t.status === "selesai").length}
                    icon={<CheckCircle2 size={20} />}
                    color="purple"
                />
            </div>
            <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-700 text-sm">
                        Tiket Ditugaskan
                    </h3>
                    <Btn
                        variant="ghost"
                        small
                        onClick={() => onNav("tiket-masuk")}
                    >
                        Lihat semua →
                    </Btn>
                </div>
                {tickets.map((ticket) => (
                    <div
                        key={ticket.id}
                        className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0"
                    >
                        <div
                            className={clx(
                                "w-2.5 h-2.5 rounded-full flex-shrink-0",
                                {
                                    proses: "bg-amber-400",
                                    selesai: "bg-green-500",
                                    diteruskan: "bg-purple-500",
                                }[ticket.status] ?? "bg-slate-400",
                            )}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 text-sm">
                                {ticket.nomor_tiket} —{" "}
                                {getProfilingIssueLabel(
                                    ticket.kendala ?? { jenis_kendala: "" },
                                )}
                            </p>
                            <p className="text-xs text-slate-400">
                                {ticket.kendala?.profiling?.opd?.nama_opd ??
                                    "OPD"}{" "}
                                · {ticket.created_at?.slice(0, 10) ?? "-"}
                            </p>
                        </div>
                        {statusBadge(
                            ticketStatusLabels[ticket.status] ?? ticket.status,
                        )}
                    </div>
                ))}
                {tickets.length === 0 && (
                    <p className="py-8 text-center text-sm text-slate-400">
                        Belum ada tiket yang ditugaskan kepada vendor ini.
                    </p>
                )}
            </Card>
            <div className="flex gap-3 flex-wrap">
                <Btn onClick={() => onNav("tiket-masuk")}>
                    <Ticket size={16} /> Tiket Masuk
                </Btn>
                <Btn
                    variant="secondary"
                    onClick={() => onNav("update-penanganan")}
                >
                    <Upload size={16} /> Update Penanganan
                </Btn>
            </div>
        </div>
    );
}

function DatabaseHandlingReview({
    tickets,
    onChanged,
}: {
    tickets: VendorTicketRecord[];
    onChanged: (ticket: VendorTicketRecord) => void;
}) {
    const awaitingReview = tickets.filter(
        (ticket) => ticket.status === "menunggu_verifikasi",
    );
    const [savingId, setSavingId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const resolve = async (
        ticket: VendorTicketRecord,
        status: "selesai" | "proses",
    ) => {
        setSavingId(ticket.id);
        setError("");
        try {
            const response = await axios.post(
                route("tiket.status", { tiket: ticket.id }),
                {
                    status,
                    catatan:
                        status === "selesai"
                            ? "Admin memverifikasi bukti dan menyetujui hasil penanganan."
                            : "Admin meminta vendor melanjutkan penanganan.",
                },
                { headers: { Accept: "application/json" } },
            );
            onChanged(response.data.ticket);
        } catch (requestError) {
            setError(
                axios.isAxiosError(requestError)
                    ? requestError.response?.data?.message ??
                          "Keputusan verifikasi gagal disimpan."
                    : "Terjadi kesalahan saat menyimpan keputusan.",
            );
        } finally {
            setSavingId(null);
        }
    };

    return (
        <div>
            <PageHeader
                title="Verifikasi Penanganan"
                sub="Periksa bukti dari vendor sebelum menyelesaikan tiket."
            />
            {error && (
                <div className="mb-4">
                    <InfoBox type="error">{error}</InfoBox>
                </div>
            )}
            <div className="space-y-4">
                {awaitingReview.map((ticket) => {
                    const evidence = ticket.riwayat?.find(
                        (history) =>
                            history.bukti_file &&
                            history.status_baru === "menunggu_verifikasi",
                    );
                    return (
                        <Card key={ticket.id} className="space-y-4 p-5">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono text-xs text-slate-400">
                                        {ticket.nomor_tiket}
                                    </span>
                                    {statusBadge("Menunggu Verifikasi")}
                                </div>
                                <h3 className="mt-1 font-bold text-slate-800">
                                    {getProfilingIssueLabel(
                                        ticket.kendala ?? {
                                            jenis_kendala: "",
                                        },
                                    )}
                                </h3>
                                <p className="text-sm text-slate-400">
                                    {ticket.kendala?.profiling?.opd?.nama_opd ??
                                        "OPD"}{" "}
                                    · Vendor:{" "}
                                    {ticket.pihak_ketiga?.nama_vendor ?? "-"}
                                </p>
                            </div>
                            {evidence && (
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-sm text-slate-700">
                                        {evidence.catatan}
                                    </p>
                                    <a
                                        href={route(
                                            "tiket.evidence",
                                            evidence.id,
                                        )}
                                        className="mt-2 inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"
                                    >
                                        <Download size={14} /> Unduh bukti
                                        penanganan
                                    </a>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-3">
                                <Btn
                                    variant="success"
                                    disabled={savingId === ticket.id}
                                    onClick={() =>
                                        resolve(ticket, "selesai")
                                    }
                                >
                                    <CheckCircle2 size={16} /> Setujui &
                                    Selesaikan
                                </Btn>
                                <Btn
                                    variant="secondary"
                                    disabled={savingId === ticket.id}
                                    onClick={() =>
                                        resolve(ticket, "proses")
                                    }
                                >
                                    <RotateCcw size={16} /> Kembalikan ke
                                    Proses
                                </Btn>
                            </div>
                        </Card>
                    );
                })}
                {awaitingReview.length === 0 && (
                    <Card className="p-10 text-center text-sm text-slate-500">
                        Tidak ada hasil penanganan yang menunggu verifikasi.
                    </Card>
                )}
            </div>
        </div>
    );
}

// ─── Tiket Masuk Vendor ───────────────────────────────────────────────────────
function TiketMasuk() {
    const mine = ticketList.filter((t) => t.vendor === "CV Jaringan Sejahtera");
    const [sel, setSel] = useState<(typeof mine)[0] | null>(null);
    const [accepted, setAccepted] = useState<Record<string, boolean>>(() => {
        try {
            return JSON.parse(
                localStorage.getItem("siprojar.vendorAccepted") ?? "{}",
            );
        } catch {
            return {};
        }
    });
    const [rejected, setRejected] = useState<Record<string, boolean>>(() => {
        try {
            return JSON.parse(
                localStorage.getItem("siprojar.vendorRejected") ?? "{}",
            );
        } catch {
            return {};
        }
    });
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectForm, setShowRejectForm] = useState(false);

    return (
        <div>
            <PageHeader
                title="Tiket Masuk"
                sub="Daftar tiket yang diteruskan kepada CV Jaringan Sejahtera. Terima atau tolak dalam 1×24 jam."
            />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2 space-y-3">
                    {mine.map((t) => {
                        const isAcc = accepted[t.id],
                            isRej = rejected[t.id];
                        return (
                            <Card
                                key={t.id}
                                className={clx(
                                    "p-4",
                                    sel?.id === t.id
                                        ? "border-blue-500 ring-1 ring-blue-400"
                                        : "",
                                )}
                                onClick={() => {
                                    setSel(t);
                                    setShowRejectForm(false);
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-mono text-xs text-slate-400">
                                                {t.id}
                                            </span>
                                            {statusBadge(
                                                isAcc
                                                    ? "Proses"
                                                    : isRej
                                                      ? "Ditolak"
                                                      : t.status,
                                            )}
                                        </div>
                                        <p className="font-semibold text-slate-800 text-sm">
                                            {t.kendala}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {t.opd} · {t.tanggal}
                                        </p>
                                        {isAcc && (
                                            <div className="mt-2 flex items-center gap-1.5 text-green-600 text-xs font-bold">
                                                <CheckCircle2
                                                    size={17}
                                                    aria-hidden="true"
                                                />
                                                Tiket Diterima — Sedang Diproses
                                            </div>
                                        )}
                                        {isRej && (
                                            <div className="mt-2 flex items-center gap-1.5 text-red-500 text-xs font-bold">
                                                <XCircle
                                                    size={17}
                                                    aria-hidden="true"
                                                />
                                                Tiket Ditolak
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                <div className="lg:col-span-3">
                    {sel ? (
                        <Card className="p-6 sticky top-4 space-y-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <span className="font-mono text-xs text-slate-400">
                                        {sel.id}
                                    </span>
                                    <h3 className="font-extrabold text-slate-800 text-lg mt-0.5">
                                        {sel.kendala}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        {sel.opd} · {sel.tanggal}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1 items-end">
                                    {statusBadge(
                                        accepted[sel.id]
                                            ? "Proses"
                                            : rejected[sel.id]
                                              ? "Ditolak"
                                              : sel.status,
                                    )}
                                    <Badge
                                        label={sel.prioritas}
                                        color={
                                            sel.prioritas === "Tinggi"
                                                ? "red"
                                                : "yellow"
                                        }
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-xs text-slate-400 font-semibold mb-1">
                                    Deskripsi Kendala
                                </p>
                                <p className="text-sm text-slate-700">
                                    {sel.deskripsi}
                                </p>
                            </div>

                            <div className="space-y-2">
                                {[
                                    ["OPD Pelapor", sel.opd],
                                    ["Prioritas", sel.prioritas],
                                    ["Tanggal Lapor", sel.tanggal],
                                    ["Diteruskan oleh", "Admin Diskominfo"],
                                    ["Batas Respons", "18 Sep 2026, 17.00 WIB"],
                                ].map(([k, v]) => (
                                    <div
                                        key={k}
                                        className="flex gap-3 py-2 border-b border-slate-100 last:border-0"
                                    >
                                        <span className="w-32 text-xs text-slate-400 font-semibold flex-shrink-0">
                                            {k}
                                        </span>
                                        <span className="text-sm text-slate-700 font-medium">
                                            {v}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {accepted[sel.id] && (
                                <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                                    <CheckCircle2
                                        size={30}
                                        className="mx-auto mb-2 text-emerald-600"
                                    />
                                    <p className="font-bold text-green-700">
                                        Tiket Telah Diterima
                                    </p>
                                    <p className="text-sm text-green-600 mt-1">
                                        Status berubah ke{" "}
                                        <strong>Proses</strong>. Segera lakukan
                                        penanganan dan unggah bukti saat selesai
                                        di menu Update Penanganan.
                                    </p>
                                </div>
                            )}
                            {rejected[sel.id] && (
                                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
                                    <XCircle
                                        size={30}
                                        className="mx-auto mb-2 text-red-600"
                                    />
                                    <p className="font-bold text-red-600">
                                        Tiket Telah Ditolak
                                    </p>
                                    <p className="text-sm text-red-500 mt-1">
                                        Admin Diskominfo mendapat notifikasi dan
                                        akan mencari vendor lain.
                                    </p>
                                </div>
                            )}

                            {!accepted[sel.id] &&
                                !rejected[sel.id] &&
                                sel.status === "Diteruskan" && (
                                    <div className="border border-slate-200 rounded-2xl p-4 space-y-4">
                                        <div>
                                            <p className="font-bold text-slate-700 text-sm mb-1">
                                                📬 Respons Tiket
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                Wajib merespons dalam{" "}
                                                <strong>1×24 jam</strong> sejak
                                                tiket diteruskan. Keterlambatan
                                                respons akan dilaporkan kepada
                                                Admin Diskominfo.
                                            </p>
                                        </div>
                                        {!showRejectForm ? (
                                            <div className="flex gap-3 flex-wrap">
                                                <Btn
                                                    variant="success"
                                                    onClick={() => {
                                                        const nextAccepted = {
                                                            ...accepted,
                                                            [sel.id]: true,
                                                        };
                                                        setAccepted(
                                                            nextAccepted,
                                                        );
                                                        localStorage.setItem(
                                                            "siprojar.vendorAccepted",
                                                            JSON.stringify(
                                                                nextAccepted,
                                                            ),
                                                        );
                                                    }}
                                                >
                                                    <CheckCircle2 size={16} />{" "}
                                                    Terima & Mulai Proses
                                                </Btn>
                                                <Btn
                                                    variant="danger"
                                                    onClick={() =>
                                                        setShowRejectForm(true)
                                                    }
                                                >
                                                    ✕ Tolak Tiket
                                                </Btn>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <FTextarea
                                                    label="Alasan Penolakan"
                                                    required
                                                    rows={3}
                                                    placeholder="Jelaskan alasan penolakan: di luar cakupan layanan, keterbatasan SDM/peralatan, dll."
                                                    value={rejectReason}
                                                    onChange={setRejectReason}
                                                />
                                                <div className="flex gap-3">
                                                    <Btn
                                                        variant="danger"
                                                        disabled={
                                                            !rejectReason.trim()
                                                        }
                                                        onClick={() => {
                                                            const nextRejected =
                                                                {
                                                                    ...rejected,
                                                                    [sel.id]: true,
                                                                };
                                                            setRejected(
                                                                nextRejected,
                                                            );
                                                            localStorage.setItem(
                                                                "siprojar.vendorRejected",
                                                                JSON.stringify(
                                                                    nextRejected,
                                                                ),
                                                            );
                                                            setShowRejectForm(
                                                                false,
                                                            );
                                                        }}
                                                    >
                                                        Konfirmasi Tolak
                                                    </Btn>
                                                    <Btn
                                                        variant="ghost"
                                                        onClick={() =>
                                                            setShowRejectForm(
                                                                false,
                                                            )
                                                        }
                                                    >
                                                        Batal
                                                    </Btn>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                            {sel.status === "Proses" && !accepted[sel.id] && (
                                <InfoBox type="warn">
                                    <Wrench size={16} className="inline" />{" "}
                                    Tiket sedang dalam proses penanganan.
                                    Perbarui status di halaman{" "}
                                    <strong>Update Penanganan</strong>.
                                </InfoBox>
                            )}
                        </Card>
                    ) : (
                        <Card className="p-12 flex flex-col items-center justify-center text-center h-64">
                            <SearchCheck
                                size={32}
                                className="mb-3 text-slate-400"
                                aria-hidden="true"
                            />
                            <p className="font-semibold text-slate-600">
                                Pilih tiket untuk ditinjau
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                                Klik tiket dari daftar untuk melihat detail dan
                                merespons
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Update Penanganan ────────────────────────────────────────────────────────
function UpdatePenanganan() {
    const [status, setStatus] = useState("Proses");
    const [note, setNote] = useState("");
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState("");
    const [selTicket, setSelTicket] = useState("TKT-002");
    const [done, setDone] = useState(false);
    const [ticketStatuses, setTicketStatuses] = useState<
        Record<string, string>
    >(() => {
        try {
            return JSON.parse(
                localStorage.getItem("siprojar.vendorTicketStatuses") ?? "{}",
            );
        } catch {
            return {};
        }
    });
    const [accepted, setAccepted] = useState<Record<string, boolean>>(() => {
        try {
            return JSON.parse(
                localStorage.getItem("siprojar.vendorAccepted") ?? "{}",
            );
        } catch {
            return {};
        }
    });
    const mine = ticketList.filter((ticket) => {
        const currentStatus = ticketStatuses[ticket.id] ?? ticket.status;
        const wasAccepted =
            accepted[ticket.id] && currentStatus === "Diteruskan";
        return (
            ticket.vendor === "CV Jaringan Sejahtera" &&
            (currentStatus === "Proses" || wasAccepted)
        );
    });
    const t = mine.find((ticket) => ticket.id === selTicket);
    const submitUpdate = () => {
        if (!note.trim() || (status === "Selesai" && !evidenceFile)) return;

        const nextStatuses = {
            ...ticketStatuses,
            [selTicket]:
                status === "Selesai" ? "Menunggu Verifikasi" : "Proses",
        };
        localStorage.setItem(
            "siprojar.vendorTicketStatuses",
            JSON.stringify(nextStatuses),
        );
        setTicketStatuses(nextStatuses);
        setDone(true);
    };

    return (
        <div>
            <PageHeader
                title="Update Penanganan Tiket"
                sub="Perbarui perkembangan dan unggah bukti penyelesaian tiket"
            />
            {done && (
                <div
                    role="status"
                    className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
                >
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
                    <div>
                        <p className="font-semibold">
                            Update Berhasil Dikirim
                        </p>
                        <p className="mt-1 text-sm text-emerald-700">
                            Catatan dan status penanganan telah diperbarui.
                            Admin Diskominfo mendapat notifikasi.
                        </p>
                    </div>
                </div>
            )}
            <div className="max-w-2xl space-y-5">
                <Card className="p-5">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-3">
                        Pilih Tiket yang Akan Diupdate
                    </p>
                    <div className="space-y-2">
                        {mine.map((t) => (
                            <label
                                key={t.id}
                                className={clx(
                                    "flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                                    selTicket === t.id
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-slate-200 hover:border-blue-300",
                                )}
                            >
                                <input
                                    type="radio"
                                    name="ticket"
                                    value={t.id}
                                    checked={selTicket === t.id}
                                    onChange={() => {
                                        setSelTicket(t.id);
                                        setDone(false);
                                        setStatus("Proses");
                                        setNote("");
                                        setEvidenceFile(null);
                                        setFileError("");
                                    }}
                                    className="accent-blue-600"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-slate-800">
                                        {t.id} — {t.kendala}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {t.opd} · {t.tanggal}
                                    </p>
                                </div>
                                {statusBadge(
                                    ticketStatuses[t.id] ??
                                        (accepted[t.id] ? "Proses" : t.status),
                                )}
                            </label>
                        ))}
                    </div>
                </Card>

                {t && !done && (
                    <div>
                    <Card className="p-5 sm:p-7 space-y-5">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                            <p className="text-xs text-blue-400 font-semibold mb-1">
                                Tiket Dipilih
                            </p>
                            <p className="font-bold text-blue-800">
                                {t.id} — {t.kendala}
                            </p>
                            <p className="text-sm text-blue-600">
                                {t.opd} · {t.tanggal}
                            </p>
                        </div>

                        <FTextarea
                            label="Catatan Perkembangan"
                            required
                            rows={5}
                            hint="Jelaskan tindakan yang sudah dilakukan, temuan di lapangan, dan langkah selanjutnya."
                            placeholder="Contoh: Tim teknisi tiba di lokasi pukul 09.00. Ditemukan kerusakan pada port switch utama di ruang server. Penggantian unit sedang dalam proses. Estimasi selesai pukul 14.00..."
                            value={note}
                            onChange={setNote}
                        />

                        <FSelect
                            label="Perbarui Status Penanganan"
                            options={["Proses", "Selesai"]}
                            value={status}
                            onChange={setStatus}
                            hint="Pilih 'Selesai' hanya jika masalah sudah benar-benar teratasi dan bukti tersedia"
                        />

                        {status === "Selesai" && (
                            <div className="border-2 border-dashed border-blue-200 rounded-2xl p-6 bg-blue-50/50 space-y-4">
                                <InfoBox type="warn">
                                    <AlertTriangle
                                        size={15}
                                        className="mr-1 inline"
                                    />{" "}
                                    Bukti penanganan <strong>wajib</strong>{" "}
                                    diunggah untuk status Selesai. Tanpa bukti,
                                    Admin tidak dapat menutup tiket.
                                </InfoBox>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 mb-2">
                                        Upload Bukti Penanganan{" "}
                                        <span className="text-red-500">*</span>
                                    </p>
                                    <p className="text-xs text-slate-400 mb-3">
                                        Foto perangkat yang diperbaiki,
                                        screenshot speed test terbaru, atau
                                        dokumentasi teknis lainnya.
                                    </p>
                                    <label className="block border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                                        <FileUp
                                            size={26}
                                            className="mx-auto mb-2 text-blue-600"
                                        />
                                        <span className="block text-sm text-slate-600">
                                            Klik untuk memilih bukti penanganan
                                        </span>
                                        <span className="mt-1 block text-xs text-slate-400">
                                            JPG, PNG, PDF — maksimal 5 MB
                                        </span>
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                                            className="sr-only"
                                            onChange={(event) => {
                                                const selectedFile =
                                                    event.target.files?.[0] ??
                                                    null;
                                                if (!selectedFile) return;
                                                const allowed =
                                                    /\.(jpe?g|png|pdf)$/i.test(
                                                        selectedFile.name,
                                                    );
                                                if (
                                                    !allowed ||
                                                    selectedFile.size >
                                                        5 * 1024 * 1024
                                                ) {
                                                    setFileError(
                                                        "Pilih file JPG, PNG, atau PDF maksimal 5 MB.",
                                                    );
                                                    setEvidenceFile(null);
                                                    event.target.value = "";
                                                    return;
                                                }
                                                setFileError("");
                                                setEvidenceFile(selectedFile);
                                            }}
                                        />
                                    </label>
                                    {fileError && (
                                        <p className="text-sm text-red-600">
                                            {fileError}
                                        </p>
                                    )}
                                    {evidenceFile && (
                                        <p className="flex items-center gap-2 text-sm text-emerald-700">
                                            <FileText size={16} />{" "}
                                            {evidenceFile.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Btn
                                type="button"
                                disabled={
                                    !note.trim() ||
                                    (status === "Selesai" && !evidenceFile)
                                }
                                onClick={submitUpdate}
                            >
                                <Upload size={15} /> Kirim Update
                            </Btn>
                            <Btn variant="secondary">
                                <Save size={15} /> Simpan Draft
                            </Btn>
                        </div>
                    </Card>
                    </div>
                )}
            </div>
        </div>
    );
}

function VendorTicketInbox({
    tickets,
    onChanged,
    onNav,
}: {
    tickets: VendorTicketRecord[];
    onChanged: (ticket: VendorTicketRecord) => void;
    onNav: (screen: Screen) => void;
}) {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [rejecting, setRejecting] = useState(false);
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const selected = tickets.find((ticket) => ticket.id === selectedId) ?? null;
    const submitResponse = async (status: "proses" | "ditolak") => {
        if (!selected) return;
        setSaving(true);
        setError("");
        try {
            const response = await axios.post(
                route("vendor.tiket.status", { tiket: selected.id }),
                {
                    status,
                    catatan:
                        status === "proses"
                            ? "Vendor menerima tiket dan mulai melakukan penanganan."
                            : reason,
                },
                { headers: { Accept: "application/json" } },
            );
            onChanged(response.data.ticket);
            setRejecting(false);
            setReason("");
        } catch (requestError) {
            setError(
                axios.isAxiosError(requestError)
                    ? requestError.response?.data?.message ??
                          "Respons tiket gagal disimpan."
                    : "Terjadi kesalahan saat merespons tiket.",
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="Tiket Masuk"
                sub="Daftar tiket yang ditugaskan kepada vendor ini. Respons dan perubahan status tersimpan ke sistem."
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <div className="space-y-3 lg:col-span-2">
                    {tickets.map((ticket) => (
                        <Card
                            key={ticket.id}
                            className={clx(
                                "p-4",
                                selectedId === ticket.id
                                    ? "border-blue-500 ring-1 ring-blue-400"
                                    : "",
                            )}
                            onClick={() => {
                                setSelectedId(ticket.id);
                                setRejecting(false);
                                setError("");
                            }}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-xs text-slate-400">
                                    {ticket.nomor_tiket}
                                </span>
                                {statusBadge(
                                    ticketStatusLabels[ticket.status] ??
                                        ticket.status,
                                )}
                            </div>
                            <p className="mt-1 font-semibold text-sm text-slate-800">
                                {getProfilingIssueLabel(
                                    ticket.kendala ?? { jenis_kendala: "" },
                                )}
                            </p>
                            <p className="text-xs text-slate-400">
                                {ticket.kendala?.profiling?.opd?.nama_opd ??
                                    "OPD"}{" "}
                                · {ticket.created_at?.slice(0, 10) ?? "-"}
                            </p>
                        </Card>
                    ))}
                    {tickets.length === 0 && (
                        <Card className="p-8 text-center text-sm text-slate-500">
                            Belum ada tiket yang ditugaskan kepada vendor ini.
                        </Card>
                    )}
                </div>
                <div className="lg:col-span-3">
                    {selected ? (
                        <Card className="sticky top-4 space-y-5 p-6">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <span className="font-mono text-xs text-slate-400">
                                        {selected.nomor_tiket}
                                    </span>
                                    <h3 className="mt-1 text-lg font-extrabold text-slate-800">
                                        {getProfilingIssueLabel(
                                            selected.kendala ?? {
                                                jenis_kendala: "",
                                            },
                                        )}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        {selected.kendala?.profiling?.opd
                                            ?.nama_opd ?? "OPD"}{" "}
                                        · {selected.created_at?.slice(0, 10) ?? "-"}
                                    </p>
                                </div>
                                {statusBadge(
                                    ticketStatusLabels[selected.status] ??
                                        selected.status,
                                )}
                            </div>
                            <div className="rounded-xl bg-slate-50 p-4">
                                <p className="mb-1 text-xs font-semibold text-slate-400">
                                    Deskripsi Kendala
                                </p>
                                <p className="text-sm text-slate-700">
                                    {selected.kendala?.deskripsi || "Tidak ada deskripsi."}
                                </p>
                            </div>
                            {error && <InfoBox type="error">{error}</InfoBox>}
                            {selected.status === "diteruskan" && (
                                <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
                                    <p className="text-sm font-bold text-slate-700">
                                        Respons Tiket
                                    </p>
                                    {!rejecting ? (
                                        <div className="flex flex-wrap gap-3">
                                            <Btn
                                                variant="success"
                                                disabled={saving}
                                                onClick={() =>
                                                    submitResponse("proses")
                                                }
                                            >
                                                <CheckCircle2 size={16} />{" "}
                                                {saving
                                                    ? "Menyimpan..."
                                                    : "Terima & Mulai Proses"}
                                            </Btn>
                                            <Btn
                                                variant="danger"
                                                disabled={saving}
                                                onClick={() =>
                                                    setRejecting(true)
                                                }
                                            >
                                                <XCircle size={16} /> Tolak Tiket
                                            </Btn>
                                        </div>
                                    ) : (
                                        <>
                                            <FTextarea
                                                label="Alasan Penolakan"
                                                required
                                                rows={3}
                                                value={reason}
                                                onChange={setReason}
                                                placeholder="Jelaskan alasan tiket tidak dapat ditangani."
                                            />
                                            <div className="flex gap-3">
                                                <Btn
                                                    variant="danger"
                                                    disabled={
                                                        saving || !reason.trim()
                                                    }
                                                    onClick={() =>
                                                        submitResponse("ditolak")
                                                    }
                                                >
                                                    {saving
                                                        ? "Menyimpan..."
                                                        : "Konfirmasi Tolak"}
                                                </Btn>
                                                <Btn
                                                    variant="ghost"
                                                    onClick={() =>
                                                        setRejecting(false)
                                                    }
                                                >
                                                    Batal
                                                </Btn>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                            {selected.status === "proses" && (
                                <InfoBox type="info">
                                    Tiket sedang ditangani. Tambahkan catatan
                                    perkembangan atau kirim hasil penanganan
                                    melalui menu Update Penanganan.
                                </InfoBox>
                            )}
                            {selected.status === "menunggu_verifikasi" && (
                                <InfoBox type="success">
                                    Hasil penanganan dan bukti sudah dikirim
                                    kepada Admin untuk diverifikasi.
                                </InfoBox>
                            )}
                            {selected.status === "ditolak" && (
                                <InfoBox type="error">
                                    Tiket ini ditolak. Alasan tercatat di
                                    histori dan dapat dilihat Admin.
                                </InfoBox>
                            )}
                            {["proses", "menunggu_verifikasi"].includes(
                                selected.status,
                            ) && (
                                <Btn
                                    variant="secondary"
                                    onClick={() =>
                                        onNav("update-penanganan")
                                    }
                                >
                                    <Upload size={15} /> Update Penanganan
                                </Btn>
                            )}
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Histori Tiket
                                </p>
                                {(selected.riwayat ?? []).map((item) => (
                                    <div
                                        key={item.id}
                                        className="border-t border-slate-100 py-2 text-sm"
                                    >
                                        <p className="font-semibold text-slate-700">
                                            {ticketStatusLabels[
                                                item.status_baru ?? ""
                                            ] ?? "Catatan"}
                                        </p>
                                        <p className="text-slate-600">
                                            {item.catatan}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {item.tanggal?.slice(0, 10)} ·{" "}
                                            {item.user?.nama ?? "Pengguna"}
                                        </p>
                                        {item.bukti_file && (
                                            <a
                                                href={route(
                                                    "tiket.evidence",
                                                    item.id,
                                                )}
                                                className="text-sm text-blue-700 hover:underline"
                                            >
                                                Unduh bukti penanganan
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ) : (
                        <Card className="flex h-64 flex-col items-center justify-center p-12 text-center">
                            <Ticket
                                size={32}
                                className="mb-3 text-slate-400"
                            />
                            <p className="font-semibold text-slate-600">
                                Pilih tiket untuk ditinjau
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

function VendorTicketUpdate({
    tickets,
    onChanged,
}: {
    tickets: VendorTicketRecord[];
    onChanged: (ticket: VendorTicketRecord) => void;
}) {
    const actionableTickets = tickets.filter(
        (ticket) => ticket.status === "proses",
    );
    const [selectedId, setSelectedId] = useState<number | null>(
        actionableTickets[0]?.id ?? null,
    );
    const [note, setNote] = useState("");
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);
    const selected =
        actionableTickets.find((ticket) => ticket.id === selectedId) ?? null;

    const submitUpdate = async () => {
        if (!selected || !note.trim() || !evidenceFile) return;
        setSaving(true);
        setError("");
        setDone(false);
        const payload = new FormData();
        payload.append("status", "menunggu_verifikasi");
        payload.append("catatan", note);
        payload.append("bukti_file", evidenceFile);
        try {
            const response = await axios.post(
                route("vendor.tiket.status", { tiket: selected.id }),
                payload,
                { headers: { Accept: "application/json" } },
            );
            onChanged(response.data.ticket);
            setNote("");
            setEvidenceFile(null);
            setDone(true);
        } catch (requestError) {
            setError(
                axios.isAxiosError(requestError)
                    ? requestError.response?.data?.errors?.bukti_file?.[0] ??
                          requestError.response?.data?.message ??
                          "Update penanganan gagal disimpan."
                    : "Terjadi kesalahan saat mengirim update.",
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="Update Penanganan Tiket"
                sub="Catat perkembangan dan kirim hasil penanganan beserta bukti untuk diverifikasi Admin"
            />
            {error && (
                <div className="mb-4">
                    <InfoBox type="error">{error}</InfoBox>
                </div>
            )}
            {done && (
                <div className="mb-4">
                    <InfoBox type="success">
                        Hasil penanganan dan bukti berhasil dikirim ke Admin.
                    </InfoBox>
                </div>
            )}
            <div className="max-w-2xl space-y-5">
                <Card className="space-y-2 p-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Pilih Tiket yang Sedang Ditangani
                    </p>
                    {actionableTickets.map((ticket) => (
                        <label
                            key={ticket.id}
                            className={clx(
                                "flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3",
                                selectedId === ticket.id
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-slate-200",
                            )}
                        >
                            <input
                                type="radio"
                                name="vendor-ticket"
                                checked={selectedId === ticket.id}
                                onChange={() => {
                                    setSelectedId(ticket.id);
                                    setNote("");
                                    setEvidenceFile(null);
                                    setError("");
                                    setDone(false);
                                }}
                            />
                            <span className="flex-1 text-sm font-semibold text-slate-700">
                                {ticket.nomor_tiket} ·{" "}
                                {getProfilingIssueLabel(
                                    ticket.kendala ?? { jenis_kendala: "" },
                                )}
                            </span>
                            {statusBadge("Proses")}
                        </label>
                    ))}
                    {actionableTickets.length === 0 && (
                        <p className="py-5 text-center text-sm text-slate-500">
                            Tidak ada tiket yang sedang dalam proses.
                        </p>
                    )}
                </Card>
                {selected && (
                    <Card className="space-y-5 p-5 sm:p-7">
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                            <p className="font-bold text-blue-800">
                                {selected.nomor_tiket} ·{" "}
                                {getProfilingIssueLabel(
                                    selected.kendala ?? {
                                        jenis_kendala: "",
                                    },
                                )}
                            </p>
                            <p className="text-sm text-blue-600">
                                {selected.kendala?.profiling?.opd?.nama_opd ??
                                    "OPD"}
                            </p>
                        </div>
                        <FTextarea
                            label="Catatan Perkembangan / Hasil Penanganan"
                            required
                            rows={5}
                            value={note}
                            onChange={setNote}
                            placeholder="Jelaskan langkah penanganan dan hasilnya."
                        />
                        <div className="space-y-3 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-5">
                            <InfoBox type="warn">
                                Bukti JPG, PNG, atau PDF maksimal 5 MB wajib
                                diunggah untuk mengirim hasil penanganan.
                            </InfoBox>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                                onChange={(event) => {
                                    const file =
                                        event.target.files?.[0] ?? null;
                                    if (!file) return;
                                    if (
                                        !/\.(jpe?g|png|pdf)$/i.test(file.name) ||
                                        file.size > 5 * 1024 * 1024
                                    ) {
                                        setError(
                                            "Pilih file JPG, PNG, atau PDF maksimal 5 MB.",
                                        );
                                        setEvidenceFile(null);
                                        event.target.value = "";
                                        return;
                                    }
                                    setError("");
                                    setEvidenceFile(file);
                                }}
                            />
                            {evidenceFile && (
                                <p className="text-sm text-emerald-700">
                                    Bukti terpilih: {evidenceFile.name}
                                </p>
                            )}
                        </div>
                        <Btn
                            disabled={saving || !note.trim() || !evidenceFile}
                            onClick={submitUpdate}
                        >
                            <Upload size={15} />{" "}
                            {saving ? "Mengirim..." : "Kirim ke Verifikasi Admin"}
                        </Btn>
                    </Card>
                )}
            </div>
        </div>
    );
}

// ─── Verifikasi Penanganan ────────────────────────────────────────────────────
function VerifikasiPenanganan() {
    const [ticketOverrides, setTicketOverrides] = useState<
        Record<string, "Proses" | "Ditutup">
    >(() => {
        try {
            return JSON.parse(
                localStorage.getItem("siprojar.ticketOverrides") ?? "{}",
            );
        } catch {
            return {};
        }
    });
    const [confirmClose, setConfirmClose] = useState<string | null>(null);
    const [notice, setNotice] = useState("");
    const done = ticketList.filter(
        (ticket) =>
            ticket.status === "Selesai" &&
            ticketOverrides[ticket.id] !== "Proses",
    );
    const persistOverride = (
        ticketId: string,
        status: "Proses" | "Ditutup",
    ) => {
        setTicketOverrides((current) => {
            const next = { ...current, [ticketId]: status };
            localStorage.setItem(
                "siprojar.ticketOverrides",
                JSON.stringify(next),
            );
            return next;
        });
    };
    return (
        <div>
            <PageHeader
                title="Verifikasi Penanganan"
                sub="Periksa hasil penanganan vendor sebelum tiket resmi ditutup. Setujui jika valid, kembalikan jika perlu perbaikan."
            />
            <div className="space-y-4">
                {done.map((t) => (
                    <Card
                        key={t.id}
                        className={clx(
                            "p-5",
                            ticketOverrides[t.id] === "Ditutup"
                                ? "opacity-70"
                                : "",
                        )}
                    >
                        <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono text-xs text-slate-400">
                                        {t.id}
                                    </span>
                                    {ticketOverrides[t.id] === "Ditutup" ? (
                                        <Badge label="Ditutup" color="green" />
                                    ) : (
                                        statusBadge(t.status)
                                    )}
                                </div>
                                <h3 className="font-bold text-slate-800">
                                    {t.kendala}
                                </h3>
                                <p className="text-sm text-slate-400">
                                    {t.opd} · Vendor: {t.vendor} · Selesai 18
                                    Sep 2026
                                </p>
                            </div>
                            {ticketOverrides[t.id] !== "Ditutup" ? (
                                <div className="flex gap-2 flex-wrap">
                                    <Btn
                                        variant="success"
                                        onClick={() => setConfirmClose(t.id)}
                                    >
                                        <CheckCircle2 size={16} /> Setujui &
                                        Tutup Tiket
                                    </Btn>
                                    <Btn
                                        variant="secondary"
                                        onClick={() => {
                                            persistOverride(t.id, "Proses");
                                            setNotice(
                                                `${t.id} dikembalikan ke status Proses.`,
                                            );
                                        }}
                                    >
                                        <RotateCcw size={16} /> Kembalikan ke
                                        Proses
                                    </Btn>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2">
                                    <span className="text-teal-600 font-bold text-sm">
                                        <CheckCircle2
                                            size={15}
                                            className="mr-1 inline"
                                        />{" "}
                                        Tiket Ditutup
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-blue-50/50 rounded-xl p-4">
                                <p className="text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wide">
                                    Catatan Penanganan
                                </p>
                                <p className="text-sm text-slate-700">
                                    Router diganti unit baru. QoS diterapkan
                                    untuk manajemen bandwidth. Seluruh
                                    workstation terhubung kembali dengan normal.
                                </p>
                            </div>
                            <div className="bg-blue-50/50 rounded-xl p-4">
                                <p className="text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wide">
                                    Speed Test Terbaru
                                </p>
                                <div className="space-y-2">
                                    {[
                                        [
                                            <>
                                                <Download size={14} /> Download
                                            </>,
                                            "84 Mbps",
                                        ],
                                        [
                                            <>
                                                <Upload size={14} /> Upload
                                            </>,
                                            "42 Mbps",
                                        ],
                                        [
                                            <>
                                                <Activity size={14} /> Ping
                                            </>,
                                            "8 ms",
                                        ],
                                    ].map(([l, v]) => (
                                        <div
                                            key={String(v)}
                                            className="flex items-center justify-between"
                                        >
                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                                {l}
                                            </span>
                                            <span className="font-bold text-slate-800 text-sm">
                                                {v}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-blue-50/50 rounded-xl p-4">
                                <p className="text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wide">
                                    Bukti Penanganan
                                </p>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center">
                                    <div className="mb-1 flex justify-center text-blue-600">
                                        <FileText size={24} />
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        foto_router_baru.jpg
                                    </p>
                                    <Btn variant="ghost" small className="mt-2">
                                        <Eye size={14} /> Preview
                                    </Btn>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
                {done.length === 0 && (
                    <Card className="p-12 text-center">
                        <SearchCheck
                            size={32}
                            className="mx-auto mb-3 text-slate-400"
                            aria-hidden="true"
                        />
                        <p className="text-slate-400">
                            Tidak ada tiket berstatus Selesai yang perlu
                            diverifikasi.
                        </p>
                    </Card>
                )}
            </div>
            {notice && (
                <div className="mt-4">
                    <InfoBox type="info">{notice}</InfoBox>
                </div>
            )}
            {confirmClose && (
                <Modal
                    title="Konfirmasi Penutupan Tiket"
                    onClose={() => setConfirmClose(null)}
                >
                    <div className="space-y-4 p-6">
                        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                            <CircleHelp
                                size={20}
                                className="mt-0.5 shrink-0 text-blue-700"
                            />
                            <p className="text-sm text-slate-700">
                                Yakin ingin menyetujui hasil penanganan dan
                                menutup tiket <strong>{confirmClose}</strong>?
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Btn
                                onClick={() => {
                                    persistOverride(confirmClose, "Ditutup");
                                    setNotice(
                                        `${confirmClose} berhasil ditutup.`,
                                    );
                                    setConfirmClose(null);
                                }}
                            >
                                <CheckCircle2 size={16} /> Ya, Tutup Tiket
                            </Btn>
                            <Btn
                                variant="secondary"
                                onClick={() => setConfirmClose(null)}
                            >
                                Batal
                            </Btn>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
export default function App({
    role: authenticatedRole,
    userName: authenticatedName,
    opdName: authenticatedOpdName,
    vendorName: authenticatedVendorName,
    opds: initialOpds = [],
    vendors: initialVendors = [],
    users: initialUsers = [],
    profilings: initialProfilings = [],
    tickets: initialTickets = [],
}: {
    role?: Role;
    userName?: string;
    opdName?: string | null;
    vendorName?: string | null;
    opds?: OpdDashboardRecord[];
    vendors?: VendorDashboardRecord[];
    users?: UserDashboardRecord[];
    profilings?: ProfilingRecord[];
    tickets?: any[];
}) {
    const path = window.location.pathname;
    const pathRole: Role = path.includes("opd/dashboard") ? "opd" : "admin";
    const initialRole = authenticatedRole ?? pathRole;
    const initialScreen: Screen = authenticatedRole
        ? (`dashboard-${authenticatedRole}` as Screen)
        : path.includes("dashboard")
          ? (`dashboard-${pathRole}` as Screen)
          : "login";
    const [screen, setScreen] = useState<Screen>(initialScreen);
    const [role, setRole] = useState<Role>(initialRole);
    const [userName, setUserName] = useState(authenticatedName ?? "");
    const [logoutError, setLogoutError] = useState("");
    const [databaseOpds, setDatabaseOpds] = useState(initialOpds);
    const [databaseVendors, setDatabaseVendors] = useState(initialVendors);
    const [databaseUsers, setDatabaseUsers] = useState(initialUsers);
    const [databaseProfilings, setDatabaseProfilings] =
        useState(initialProfilings);
    const [databaseTickets, setDatabaseTickets] = useState(initialTickets);
    const [selectedProfilingId, setSelectedProfilingId] = useState<
        number | null
    >(null);
    const editablePeriodProfiling = [...databaseProfilings]
        .filter((profiling) =>
            ["draft", "dikembalikan"].includes(
                profiling.status_verifikasi,
            ),
        )
        .sort((a, b) => b.periode.localeCompare(a.periode))[0];
    const profilingToContinue =
        databaseProfilings.find(
            (profiling) => profiling.id === selectedProfilingId,
        ) ?? editablePeriodProfiling;
    const databaseProfilingQueue = databaseProfilings
        .filter((profiling) => profiling.status_verifikasi === "diajukan")
        .map(toProfilingQueueItem);

    const handleLogout = async () => {
        setLogoutError("");
        try {
            await axios.post(route("logout"), {}, {
                headers: { Accept: "application/json" },
            });
            window.location.assign(route("login"));
        } catch {
            setLogoutError(
                "Gagal keluar dari sistem. Periksa koneksi lalu coba lagi.",
            );
        }
    };
    const currentTitle =
        [...navItems.admin, ...navItems.opd, ...navItems.vendor].find(
            (i) => i.screen === screen,
        )?.label ?? "SIPROJAR";
    const profilingForm = (
        <FormProfiling
            key={selectedProfilingId ?? "profiling-form"}
            onNav={setScreen}
            opdName={authenticatedOpdName}
            existingProfiling={profilingToContinue}
            onCreated={(profiling) =>
                setDatabaseProfilings((current) => [
                    profiling,
                    ...current.filter((item) => item.id !== profiling.id),
                ])
            }
        />
    );

    if (screen === "login") return <Login />;

    const render = () => {
        switch (screen) {
            case "dashboard-admin":
                return (
                    <DashboardAdmin
                        onNav={setScreen}
                        opds={databaseOpds}
                        profilings={databaseProfilings}
                        tickets={databaseTickets}
                    />
                );
            case "master-opd":
                return (
                    <MasterOPD
                        opds={databaseOpds}
                        onChanged={setDatabaseOpds}
                    />
                );
            case "master-user":
                return (
                    <MasterUser
                        users={databaseUsers}
                        opds={databaseOpds}
                        vendors={databaseVendors}
                        onChanged={setDatabaseUsers}
                    />
                );
            case "form-profiling":
                return null;
            case "riwayat-profiling":
                return (
                    <RiwayatProfiling
                        onContinue={(profilingId) => {
                            setSelectedProfilingId(profilingId);
                            setScreen("form-profiling");
                        }}
                        profilings={databaseProfilings}
                    />
                );
            case "verifikasi-profiling":
                return (
                    <VerifikasiProfiling
                        queue={databaseProfilingQueue}
                        onResolved={(id, status, kesimpulan) =>
                            setDatabaseProfilings((current) =>
                                current.map((profiling) =>
                                    profiling.id === id
                                        ? {
                                              ...profiling,
                                              status_verifikasi: status,
                                              kesimpulan,
                                              tanggal_diverifikasi:
                                                  new Date().toISOString(),
                                          }
                                        : profiling,
                                ),
                            )
                        }
                    />
                );
            case "kelola-tiket":
                return (
                    <KelolaTicket
                        tickets={databaseTickets}
                        vendors={databaseVendors}
                        onVendorCreated={(vendor) =>
                            setDatabaseVendors((current) =>
                                current.some((item) => item.id === vendor.id)
                                    ? current
                                    : [...current, vendor].sort((a, b) =>
                                          a.nama_vendor.localeCompare(
                                              b.nama_vendor,
                                          ),
                                      ),
                            )
                        }
                        onChanged={(ticket) =>
                            setDatabaseTickets((current) =>
                                current.map((item) =>
                                    item.id === ticket.id ? ticket : item,
                                ),
                            )
                        }
                    />
                );
            case "verifikasi-penanganan":
                return (
                    <DatabaseHandlingReview
                        tickets={databaseTickets}
                        onChanged={(ticket) =>
                            setDatabaseTickets((current) =>
                                current.map((item) =>
                                    item.id === ticket.id ? ticket : item,
                                ),
                            )
                        }
                    />
                );
            case "laporan":
                return <Laporan />;
            case "dashboard-opd":
                return (
                    <DashboardOPD
                        onNav={setScreen}
                        opdName={authenticatedOpdName}
                    />
                );
            case "tiket-pengaduan":
                return (
                    <TiketPengaduan
                        onNav={setScreen}
                        opdName={authenticatedOpdName}
                        profilings={databaseProfilings}
                        onCreated={(ticket) => {
                            setDatabaseTickets((current) => [
                                ticket,
                                ...current.filter(
                                    (item) =>
                                        item.nomor_tiket !==
                                        ticket.nomor_tiket,
                                ),
                            ])
                            setDatabaseProfilings((current) =>
                                current.map((profiling) =>
                                    profiling.id ===
                                    ticket.kendala?.data_profiling_id
                                        ? {
                                              ...profiling,
                                              kendala: (
                                                  profiling.kendala ?? []
                                              ).map((issue) =>
                                                  issue.id ===
                                                  ticket.kendala_id
                                                      ? {
                                                            ...issue,
                                                            tiket: {
                                                                id: ticket.id,
                                                                nomor_tiket:
                                                                    ticket.nomor_tiket,
                                                                status: ticket.status,
                                                            },
                                                        }
                                                      : issue,
                                              ),
                                          }
                                        : profiling,
                                ),
                            );
                        }}
                    />
                );
            case "pantau-tiket":
                return <PantauTiket tickets={databaseTickets} />;
            case "dashboard-vendor":
                return (
                    <DashboardVendor
                        onNav={setScreen}
                        tickets={databaseTickets}
                        vendorName={authenticatedVendorName ?? "Vendor"}
                    />
                );
            case "tiket-masuk":
                return (
                    <VendorTicketInbox
                        tickets={databaseTickets}
                        onNav={setScreen}
                        onChanged={(ticket) =>
                            setDatabaseTickets((current) =>
                                current.map((item) =>
                                    item.id === ticket.id ? ticket : item,
                                ),
                            )
                        }
                    />
                );
            case "update-penanganan":
                return (
                    <VendorTicketUpdate
                        tickets={databaseTickets}
                        onChanged={(ticket) =>
                            setDatabaseTickets((current) =>
                                current.map((item) =>
                                    item.id === ticket.id ? ticket : item,
                                ),
                            )
                        }
                    />
                );
            default:
                return null;
        }
    };

    return (
        <GridBackground>
            <div className="flex min-h-screen bg-transparent">
                <Sidebar
                    role={role}
                    current={screen}
                    onNav={setScreen}
                    onLogout={handleLogout}
                    userName={userName}
                />
                <div className="flex-1 flex flex-col min-w-0">
                    <TopBar title={currentTitle} onLogout={handleLogout} />
                    <main className="flex-1 overflow-visible pb-20 lg:pb-0">
                        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                            {logoutError && (
                                <div className="mb-4">
                                    <InfoBox type="error">{logoutError}</InfoBox>
                                </div>
                            )}
                            {render()}
                            <div
                                className={
                                    screen === "form-profiling" ? "" : "hidden"
                                }
                            >
                                {profilingForm}
                            </div>
                        </div>
                    </main>
                </div>
                <BottomNav role={role} current={screen} onNav={setScreen} />
            </div>
        </GridBackground>
    );
}
