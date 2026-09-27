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

// ─── Types ─────────────────────────────────────────────────────────────────
type Role = "admin" | "opd" | "vendor";
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
            onChange={(e) => onChange?.(e.target.value)}
            className={clx(
                "w-full px-4 py-2.5 text-sm rounded-xl border bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all",
                error
                    ? "border-red-400 bg-red-50"
                    : "border-slate-200 hover:border-slate-300",
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
}: {
    label?: string;
    options: string[];
    value?: string;
    onChange?: (v: string) => void;
    hint?: string;
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
function Login({ onLogin }: { onLogin: (role: Role, name: string) => void }) {
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const users = [
        {
            email: "admin@diskominfo.go.id",
            pw: "admin123",
            role: "admin" as Role,
            name: "Budi Santoso",
            active: true,
        },
        {
            email: "opd@dikbud.go.id",
            pw: "opd123",
            role: "opd" as Role,
            name: "Siti Rahayu",
            active: true,
        },
        {
            email: "vendor@jaringan.id",
            pw: "vendor123",
            role: "vendor" as Role,
            name: "CV Jaringan Sejahtera",
            active: true,
        },
        {
            email: "nonaktif@test.id",
            pw: "test",
            role: "opd" as Role,
            name: "Test User",
            active: false,
        },
    ];
    const submit = () => {
        setErr("");
        setLoading(true);
        setTimeout(() => {
            const u = users.find((u) => u.email === email && u.pw === pw);
            if (!u)
                setErr(
                    "Email atau kata sandi tidak sesuai. Periksa kembali dan coba lagi.",
                );
            else if (!u.active)
                setErr(
                    "Akun Anda dinonaktifkan. Hubungi Administrator Diskominfo untuk bantuan.",
                );
            else onLogin(u.role, u.name);
            setLoading(false);
        }, 700);
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
                            disabled={loading || !email || !pw}
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

function NocOverview({ onNav }: { onNav: (screen: Screen) => void }) {
    const [sector, setSector] = useState("Semua sektor");
    const opdHealth = [
        {
            name: "Dinas Kesehatan",
            sector: "Pelayanan Publik",
            health: "98.5%",
            status: "Normal",
            latency: "22 ms",
        },
        {
            name: "Dinas Pendidikan",
            sector: "Sekolah / Pendidikan",
            health: "96.8%",
            status: "Normal",
            latency: "28 ms",
        },
        {
            name: "Dinas PUPR",
            sector: "Pelayanan Publik",
            health: "84.2%",
            status: "High latency",
            latency: "115 ms",
        },
    ];
    const filtered =
        sector === "Semua sektor"
            ? opdHealth
            : opdHealth.filter((opd) => opd.sector === sector);
    return (
        <>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="p-5 lg:col-span-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <div className="mb-1 flex items-center gap-2">
                                <Activity size={17} className="text-blue-600" />
                                <h3 className="text-sm font-bold text-slate-800">
                                    Network Health Index
                                </h3>
                            </div>
                            <p className="text-xs text-slate-400">
                                Rata-rata latency, packet loss, dan uptime 30
                                hari
                            </p>
                        </div>
                        <span className="text-3xl font-extrabold text-blue-700">
                            96.4%
                        </span>
                    </div>
                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full w-[96.4%] rounded-full bg-blue-600" />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                        <div>
                            <p className="text-slate-400">Uptime</p>
                            <p className="font-bold text-slate-800">99.1%</p>
                        </div>
                        <div>
                            <p className="text-slate-400">Packet loss</p>
                            <p className="font-bold text-slate-800">0.08%</p>
                        </div>
                        <div>
                            <p className="text-slate-400">Latency rata-rata</p>
                            <p className="font-bold text-slate-800">34 ms</p>
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
                        1.28{" "}
                        <span className="text-base font-semibold text-slate-400">
                            Gbps
                        </span>
                    </p>
                    <div className="mt-3 h-2 rounded-full bg-slate-100">
                        <div className="h-full w-[68%] rounded-full bg-indigo-500" />
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                        68% terpakai dari kapasitas 1.88 Gbps
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
                                Klik OPD untuk membuka profil dan inventaris
                                aset
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
                            {[
                                "Semua sektor",
                                "Pelayanan Publik",
                                "Sekolah / Pendidikan",
                            ].map((item) => (
                                <button
                                    key={item}
                                    onClick={() => setSector(item)}
                                    className={`rounded-lg px-2.5 py-1.5 text-[10px] font-semibold ${sector === item ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        {filtered.map((opd) => (
                            <button
                                key={opd.name}
                                onClick={() => onNav("master-opd")}
                                className="flex w-full items-center justify-between rounded-xl border border-slate-100 p-3 text-left hover:border-blue-200 hover:bg-blue-50/40"
                            >
                                <span className="flex items-center gap-3">
                                    <span
                                        className={`h-2.5 w-2.5 rounded-full ${opd.status === "Normal" ? "bg-emerald-500" : "bg-amber-400"}`}
                                    />
                                    <span>
                                        <span className="block text-sm font-semibold text-slate-800">
                                            {opd.name}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {opd.sector} · {opd.latency}
                                        </span>
                                    </span>
                                </span>
                                <span className="text-sm font-bold text-blue-700">
                                    {opd.health}
                                </span>
                            </button>
                        ))}
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
                        <div className="flex gap-3">
                            <span className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    Link Dinas PUPR
                                </p>
                                <p className="text-xs text-slate-400">
                                    Latency di atas SLA · 115 ms
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" />
                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    Kapasitas VLAN 20
                                </p>
                                <p className="text-xs text-slate-400">
                                    Pemakaian IP mencapai 82%
                                </p>
                            </div>
                        </div>
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
                                Perangkat terpantau
                            </p>
                            <p className="text-xl font-extrabold text-slate-800">
                                248
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <ShieldCheck size={19} className="text-emerald-600" />
                        <div>
                            <p className="text-xs text-slate-400">
                                SLA vendor bulan ini
                            </p>
                            <p className="text-xl font-extrabold text-slate-800">
                                99.2%
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <MapPinned size={19} className="text-indigo-600" />
                        <div>
                            <p className="text-xs text-slate-400">
                                OPD aktif di peta GIS
                            </p>
                            <p className="text-xl font-extrabold text-slate-800">
                                32 / 32
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
}

// ─── Dashboard Admin ──────────────────────────────────────────────────────────
function DashboardAdmin({ onNav }: { onNav: (s: Screen) => void }) {
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
    const normalizeOpd = (name: string) =>
        name === "Badan Kepegawaian Daerah"
            ? "BKD"
            : name === "Dinas Pendidikan dan Kebudayaan"
              ? "Dinas Pendidikan"
              : name;
    const getPeriod = (date: string) => {
        const [yearValue, monthValue] = date.split("-").map(Number);
        return `${monthAbbreviations[monthValue - 1]} ${yearValue}`;
    };
    const periodOrder = (value: string) => {
        const [month, yearValue] = value.split(" ");
        return Number(yearValue) * 12 + monthAbbreviations.indexOf(month);
    };
    const [opdFilter, setOpdFilter] = useState("Semua OPD");
    const [periodFilter, setPeriodFilter] = useState("Semua Periode");
    const [resolvedProfilings] = useState<Record<number, string>>(() => {
        try {
            return JSON.parse(
                localStorage.getItem("siprojar.adminResolvedProfilings") ?? "{}",
            );
        } catch {
            return {};
        }
    });
    const opdOptions = Array.from(
        new Set([
            ...reportRows.map((row) => row.opd),
            ...ticketList.map((ticket) => normalizeOpd(ticket.opd)),
            ...profilingQueue.map((profiling) =>
                normalizeOpd(profiling.opd),
            ),
        ]),
    ).sort();
    const periodOptions = [
        "Semua Periode",
        ...Array.from(
            new Set([
                ...reportRows.map(
                    (row) =>
                        `${monthAbbreviations[row.month - 1]} ${row.year}`,
                ),
                ...ticketList.map((ticket) => getPeriod(ticket.tanggal)),
                ...profilingQueue.map((profiling) =>
                    getPeriod(profiling.diajukan),
                ),
            ]),
        ).sort((left, right) => periodOrder(right) - periodOrder(left)),
    ];
    const matchesOpd = (name: string) =>
        opdFilter === "Semua OPD" || normalizeOpd(name) === opdFilter;
    const matchesPeriod = (date: string) =>
        periodFilter === "Semua Periode" || getPeriod(date) === periodFilter;
    const filteredRows = reportRows.filter(
        (row) =>
            matchesOpd(row.opd) &&
            (periodFilter === "Semua Periode" ||
                `${monthAbbreviations[row.month - 1]} ${row.year}` ===
                    periodFilter),
    );
    const filteredTickets = ticketList.filter(
        (ticket) => matchesOpd(ticket.opd) && matchesPeriod(ticket.tanggal),
    );
    const filteredProfilings = profilingQueue.filter(
        (profiling) =>
            !resolvedProfilings[profiling.id] &&
            matchesOpd(profiling.opd) &&
            matchesPeriod(profiling.diajukan),
    );
    const conditionData = kondisiPie.map((condition) => {
        const key = condition.name.toLowerCase() as "baik" | "sedang" | "buruk";
        const average = filteredRows.length
            ? Math.round(
                  filteredRows.reduce((total, row) => total + row[key], 0) /
                      filteredRows.length,
              )
            : 0;
        return { ...condition, value: average };
    });
    const ticketTrendData = periodOptions
        .slice(1)
        .reverse()
        .map((period) => {
            const ticketsInPeriod = filteredTickets.filter(
                (ticket) => getPeriod(ticket.tanggal) === period,
            );
            return {
                bulan: period,
                baru: ticketsInPeriod.filter((ticket) => ticket.status === "Baru")
                    .length,
                proses: ticketsInPeriod.filter((ticket) =>
                    ["Proses", "Diteruskan"].includes(ticket.status),
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

    return (
        <div className="space-y-6">
            <PageHeader
                title="Dashboard"
                sub="Rekap kondisi jaringan dan aktivitas sistem · 18 Sep 2026"
                action={
                    <>
                        <CommandPalette onNav={onNav} />
                        <FSelect
                            label="OPD"
                            options={["Semua OPD", ...opdOptions]}
                            value={opdFilter}
                            onChange={setOpdFilter}
                        />
                        <FSelect
                            label="Bulan / Tahun"
                            options={periodOptions}
                            value={periodFilter}
                            onChange={setPeriodFilter}
                        />
                    </>
                }
            />
            <NocOverview onNav={onNav} />
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                <StatCard
                    label="Total OPD"
                    value={new Set(filteredRows.map((row) => row.opd)).size}
                    icon={<Building2 size={20} />}
                    color="blue"
                />
                <StatCard
                    label="Profiling Diajukan"
                    value={filteredRows.filter((row) => row.profiling === "Diajukan").length}
                    icon={<ClipboardList size={20} />}
                    color="amber"
                    sub="Menunggu tinjau"
                />
                <StatCard
                    label="Profiling Diverifikasi"
                    value={filteredRows.filter((row) => row.profiling === "Diverifikasi").length}
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
                    value={filteredTickets.filter((ticket) => ["Proses", "Diteruskan"].includes(ticket.status)).length}
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
function MasterOPD() {
    type OpdRow = {
        id: number;
        nama: string;
        alamat: string;
        pegawai: number;
        koneksi: number;
        profiling: string;
    };
    const [data, setData] = useState<OpdRow[]>(opdList);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
    const [editing, setEditing] = useState<OpdRow | null>(null);
    const [form, setForm] = useState({ nama: "", alamat: "", pegawai: "" });
    const [errors, setErrors] = useState<Record<string, string>>({});

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
        setForm({ nama: o.nama, alamat: o.alamat, pegawai: String(o.pegawai) });
        setErrors({});
        setModal("edit");
    };
    const openDelete = (o: OpdRow) => {
        setEditing(o);
        setModal("delete");
    };

    const validate = () => {
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
    const save = () => {
        if (!validate()) return;
        if (modal === "add")
            setData([
                ...data,
                {
                    id: Date.now(),
                    nama: form.nama,
                    alamat: form.alamat,
                    pegawai: Number(form.pegawai),
                    koneksi: 1,
                    profiling: "Belum",
                },
            ]);
        else if (editing)
            setData(
                data.map((o) =>
                    o.id === editing.id
                        ? {
                              ...o,
                              nama: form.nama,
                              alamat: form.alamat,
                              pegawai: Number(form.pegawai),
                          }
                        : o,
                ),
            );
        setModal(null);
    };
    const del = () => {
        if (editing) setData(data.filter((o) => o.id !== editing.id));
        setModal(null);
    };

    return (
        <div>
            <PageHeader
                title="Data OPD"
                sub="Kelola Organisasi Perangkat Daerah yang terdaftar dalam sistem"
                action={<Btn onClick={openAdd}>＋ Tambah OPD</Btn>}
            />
            <Card>
                <div className="p-4 border-b border-slate-100">
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        placeholder="Cari nama OPD atau alamat..."
                    />
                </div>
                {/* Mobile */}
                <div className="sm:hidden divide-y divide-slate-100">
                    {filtered.map((o) => (
                        <div key={o.id} className="p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="font-semibold text-slate-800 text-sm">
                                        {o.nama}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {o.alamat}
                                    </p>
                                </div>
                                {statusBadge(o.profiling)}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span>
                                    <Users size={14} className="inline" />{" "}
                                    {o.pegawai} pegawai
                                </span>
                                <span>🔗 {o.koneksi} koneksi</span>
                            </div>
                            <div className="flex gap-2 pt-1">
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
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full min-w-[760px] text-sm">
                        <thead>
                            <tr className="border-b border-slate-100">
                                {[
                                    "No",
                                    "Nama OPD",
                                    "Alamat",
                                    "Pegawai",
                                    "Koneksi",
                                    "Status Profiling",
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
                                    <td className="px-4 py-3.5 text-slate-600">
                                        {o.pegawai}
                                    </td>
                                    <td className="px-4 py-3.5 text-slate-600">
                                        {o.koneksi}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        {statusBadge(o.profiling)}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex flex-wrap gap-2">
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
                        <Btn onClick={save}>
                            <Save size={15} /> Simpan Data
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
function MasterUser() {
    type UserRow = {
        id: number;
        nama: string;
        email: string;
        role: string;
        relasi: string;
        status: string;
    };
    const [data, setData] = useState<UserRow[]>(() => {
        try {
            const storedUsers = localStorage.getItem("siprojar.adminUsers");
            if (!storedUsers) return userList;
            const parsedUsers: unknown = JSON.parse(storedUsers);
            return Array.isArray(parsedUsers)
                ? (parsedUsers as UserRow[])
                : userList;
        } catch {
            return userList;
        }
    });
    useEffect(() => {
        localStorage.setItem("siprojar.adminUsers", JSON.stringify(data));
    }, [data]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("Semua Role");
    const [statusFilter, setStatusFilter] = useState("Semua Status");
    const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
    const [editing, setEditing] = useState<UserRow | null>(null);
    const [form, setForm] = useState({
        nama: "",
        email: "",
        pw: "",
        role: "OPD",
        relasi: "",
        status: "Aktif",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
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
            role: "OPD",
            relasi: "",
            status: "Aktif",
        });
        setErrors({});
        setModal("add");
    };
    const openEdit = (u: UserRow) => {
        setEditing(u);
        setForm({
            nama: u.nama,
            email: u.email,
            pw: "",
            role: u.role,
            relasi: u.relasi,
            status: u.status,
        });
        setErrors({});
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
        if (!form.relasi.trim()) e.relasi = "Wajib diisi";
        const dup = data.find(
            (u) => u.email === form.email && u.id !== editing?.id,
        );
        if (dup) e.email = "Email sudah digunakan akun lain";
        setErrors(e);
        return Object.keys(e).length === 0;
    };
    const save = () => {
        if (!validate()) return;
        if (modal === "add")
            setData([
                ...data,
                {
                    id: Date.now(),
                    nama: form.nama,
                    email: form.email,
                    role: form.role,
                    relasi: form.relasi,
                    status: form.status,
                },
            ]);
        else if (editing)
            setData(
                data.map((u) =>
                    u.id === editing.id
                        ? {
                              ...u,
                              nama: form.nama,
                              email: form.email,
                              role: form.role,
                              relasi: form.relasi,
                              status: form.status,
                          }
                        : u,
                ),
            );
        setModal(null);
    };
    const del = () => {
        if (editing) setData(data.filter((u) => u.id !== editing.id));
        setModal(null);
    };
    const toggleStatus = (u: UserRow) =>
        setData(
            data.map((x) =>
                x.id === u.id
                    ? {
                          ...x,
                          status: x.status === "Aktif" ? "Nonaktif" : "Aktif",
                      }
                    : x,
            ),
        );

    return (
        <div>
            <PageHeader
                title="Data User"
                sub="Kelola akun pengguna sistem berdasarkan role dan OPD/vendor"
                action={<Btn onClick={openAdd}>＋ Tambah Akun</Btn>}
            />
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
                            value={form.role}
                            onChange={(v) => setForm({ ...form, role: v })}
                        />
                        <FInput
                            label="OPD / Pihak Ketiga"
                            placeholder="Nama instansi atau vendor"
                            value={form.relasi}
                            onChange={(v) => setForm({ ...form, relasi: v })}
                            error={errors.relasi}
                            required
                        />
                        <FSelect
                            label="Status Akun"
                            options={["Aktif", "Nonaktif"]}
                            value={form.status}
                            onChange={(v) => setForm({ ...form, status: v })}
                        />
                    </div>
                    <div className="px-6 pb-6 flex gap-3">
                        <Btn onClick={save}>
                            <Save size={15} /> Simpan Akun
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
function FormProfiling({ onNav }: { onNav: (s: Screen) => void }) {
    const [step, setStep] = useState(0);
    const [done, setDone] = useState(false);
    const [apps, setApps] = useState(["SIMDA", "SIPD"]);
    const [kendala, setKendala] = useState<string[]>([]);
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
    ];

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
                        <FSelect
                            label="Nama OPD"
                            options={[
                                "Dinas Pendidikan dan Kebudayaan",
                                "Dinas Kesehatan",
                                "Dinas PUPR",
                            ]}
                            hint="OPD sesuai akun yang login"
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
                            />
                            <FInput
                                label="Jumlah Perangkat Terhubung"
                                type="number"
                                placeholder="52"
                                hint="PC, laptop, printer, dll"
                            />
                        </div>
                        <FInput
                            label="Nama ISP / Penyedia Layanan"
                            placeholder="PT Telkom Indonesia"
                            hint="Penyedia internet yang digunakan"
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
                            />
                            <FInput
                                label="Upload (Mbps)"
                                type="number"
                                placeholder="0"
                                hint="Kecepatan unggah"
                            />
                            <FInput
                                label="Ping (ms)"
                                type="number"
                                placeholder="0"
                                hint="Latensi jaringan"
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
                        />
                        <FInput
                            label="Tanggal Pengukuran"
                            type="date"
                            hint="Tanggal saat speed test dilakukan"
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
                        <FTextarea
                            label="Deskripsi Kendala (opsional)"
                            placeholder="Jelaskan detail: kapan terjadi, frekuensi, dampak, langkah yang sudah dicoba..."
                            rows={4}
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
                                ["OPD", "Dinas Pendidikan dan Kebudayaan"],
                                [
                                    "Koneksi",
                                    "Fiber Optik — PT Telkom Indonesia",
                                ],
                                ["Bandwidth", "100 Mbps"],
                                ["Jumlah Device", "52"],
                                ["Aplikasi", apps.filter(Boolean).join(", ")],
                                [
                                    "Speed Test",
                                    "DL: 87 Mbps · UL: 34 Mbps · Ping: 12ms",
                                ],
                                ["Kondisi", "Baik"],
                                [
                                    "Kendala",
                                    kendala.length
                                        ? kendala.join(", ")
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
                        <Btn variant="ghost">
                            <Save size={15} /> Simpan Draft
                        </Btn>
                    </div>
                    {step < 4 ? (
                        <Btn onClick={() => setStep((s) => s + 1)}>
                            Lanjutkan →
                        </Btn>
                    ) : (
                        <Btn onClick={() => setDone(true)}>
                            <FilePenLine size={16} /> Ajukan Profiling
                        </Btn>
                    )}
                </div>
            </Card>
        </div>
    );
}

// ─── Riwayat Profiling ────────────────────────────────────────────────────────
function RiwayatProfiling({ onNav }: { onNav: (s: Screen) => void }) {
    const [sel, setSel] = useState<(typeof riwayatProfiling)[0] | null>(null);
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
                    {riwayatProfiling.map((r) => (
                        <Card
                            key={r.periode}
                            className={clx(
                                "p-4",
                                sel?.periode === r.periode
                                    ? "border-blue-500 ring-1 ring-blue-400 bg-blue-50/20"
                                    : "",
                            )}
                            onClick={() => setSel(r)}
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
                            {r.status !== "Ditolak" && (
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
                                        <strong>{r.ping}</strong>ms
                                    </span>
                                </div>
                            )}
                        </Card>
                    ))}
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

                            {sel.status === "Ditolak" ? (
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

                            {sel.status !== "Ditolak" && (
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        [
                                            <>
                                                <Download size={14} /> Download
                                            </>,
                                            `${sel.dl} Mbps`,
                                        ],
                                        [
                                            <>
                                                <Upload size={14} /> Upload
                                            </>,
                                            `${sel.ul} Mbps`,
                                        ],
                                        [
                                            <>
                                                <Activity size={14} /> Ping
                                            </>,
                                            `${sel.ping} ms`,
                                        ],
                                    ].map(([l, v]) => (
                                        <div
                                            key={String(v)}
                                            className="bg-slate-50 rounded-xl p-3 text-center"
                                        >
                                            <p className="text-xs text-slate-400">
                                                {l}
                                            </p>
                                            <p className="font-bold text-slate-800 text-lg mt-0.5">
                                                {v}
                                            </p>
                                        </div>
                                    ))}
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
                                {sel.status === "Ditolak" && (
                                    <Btn
                                        small
                                        onClick={() => onNav("form-profiling")}
                                    >
                                        <FilePenLine size={15} /> Isi Ulang
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
                    {sel.status !== "Ditolak" && (
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
function VerifikasiProfiling() {
    const [sel, setSel] = useState<(typeof profilingQueue)[0] | null>(null);
    const [resolvedProfilings, setResolvedProfilings] = useState<
        Record<number, "approved" | "rejected">
    >(() => {
        try {
            return JSON.parse(
                localStorage.getItem("siprojar.adminResolvedProfilings") ?? "{}",
            );
        } catch {
            return {};
        }
    });
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

    const pct = sel ? Math.round((sel.dl / parseInt(sel.bandwidth)) * 100) : 0;
    const wajar = pct >= 60;
    const canSubmit = kesimpulan.trim().length >= 10 && kewajaranOk !== null;
    const resolveProfiling = (decision: "approved" | "rejected") => {
        if (!sel) return;
        const nextResolved = { ...resolvedProfilings, [sel.id]: decision };
        localStorage.setItem(
            "siprojar.adminResolvedProfilings",
            JSON.stringify(nextResolved),
        );
        setResolvedProfilings(nextResolved);
        setDecisionModal(null);
        setDone(decision);
        setSel(null);
    };
    const filteredProfilings = profilingQueue.filter((profiling) => {
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
                        <Card className="p-8 text-center">
                            <p className="text-slate-400 text-sm">
                                Tidak ada profiling yang sesuai filter.
                            </p>
                        </Card>
                    )}
                </div>

                <div className="lg:col-span-3">
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
function KelolaTicket() {
    const [sel, setSel] = useState<(typeof ticketList)[0] | null>(null);
    const [filter, setFilter] = useState("Semua Status");
    const [opdFilter, setOpdFilter] = useState("Semua OPD");
    const [action, setAction] = useState<"internal" | "teruskan" | null>(null);
    const [vendor, setVendor] = useState("CV Jaringan Sejahtera");
    const [actionDone, setActionDone] = useState(false);

    const filtered = ticketList.filter(
        (t) =>
            (filter === "Semua Status" || t.status === filter) &&
            (opdFilter === "Semua OPD" || t.opd === opdFilter),
    );

    return (
        <div>
            <PageHeader
                title="Kelola Tiket Pengaduan"
                sub="Tinjau tiket masuk dan tentukan penanganan: internal Diskominfo atau diteruskan ke vendor"
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
                                "Selesai",
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
                                        ticketList.map((ticket) => ticket.opd),
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
                                        <FSelect
                                            label="Pilih Vendor / Pihak Ketiga"
                                            options={[
                                                "CV Jaringan Sejahtera",
                                                "PT Koneksi Andal",
                                            ]}
                                            value={vendor}
                                            onChange={setVendor}
                                            hint="Vendor dipilih akan mendapat notifikasi dan bisa menerima/menolak tiket"
                                        />
                                    )}
                                    {action && (
                                        <div className="flex gap-3 pt-2">
                                            <Btn
                                                onClick={() =>
                                                    setActionDone(true)
                                                }
                                            >
                                                {action === "internal"
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
function DashboardOPD({ onNav }: { onNav: (s: Screen) => void }) {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Dashboard OPD"
                sub="Dinas Pendidikan dan Kebudayaan · Status jaringan dan pengaduan"
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
function TiketPengaduan() {
    const [step, setStep] = useState(0);
    const [selK, setSelK] = useState("");
    const [otherText, setOtherText] = useState("");
    const [desc, setDesc] = useState("");
    const [contact, setContact] = useState("");
    const [done, setDone] = useState(false);

    const opts = [
        {
            id: "Koneksi Putus",
            icon: <XCircle size={24} />,
            label: "Koneksi Putus",
            desc: "Internet tidak dapat terhubung sama sekali",
        },
        {
            id: "Speed Lambat",
            icon: <Gauge size={24} />,
            label: "Speed Lambat",
            desc: "Kecepatan jauh di bawah bandwidth berlangganan",
        },
        {
            id: "Perangkat Rusak",
            icon: <HeartCrack size={24} />,
            label: "Perangkat Rusak",
            desc: "Router/switch/access point tidak berfungsi",
        },
        {
            id: "Konfigurasi Jaringan",
            icon: <Settings2 size={24} />,
            label: "Konfigurasi Jaringan",
            desc: "Pengaturan VLAN/IP/DNS bermasalah",
        },
        {
            id: "Lainnya",
            icon: <Pin size={24} />,
            label: "Lainnya",
            desc: "Kendala lain yang tidak tercantum di atas",
        },
    ];

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
                    <strong className="text-blue-600">TKT-005</strong>
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
                        setSelK("");
                        setDesc("");
                        setOtherText("");
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
                                Pilih Jenis Kendala
                            </h3>
                            <p className="text-sm text-slate-400 mb-5">
                                Pilih kategori yang paling sesuai. Jika tidak
                                ada yang cocok, pilih <strong>Lainnya</strong>{" "}
                                dan deskripsikan kendala Anda.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                                {opts.map((k) => (
                                    <button
                                        key={k.id}
                                        onClick={() => setSelK(k.id)}
                                        className={clx(
                                            "p-4 rounded-2xl border-2 text-left transition-all cursor-pointer group",
                                            selK === k.id
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/30",
                                        )}
                                    >
                                        <div className="text-2xl mb-2 transition-transform inline-block">
                                            {k.icon}
                                        </div>
                                        <p
                                            className={`font-semibold text-sm mb-0.5 ${
                                                selK === k.id
                                                    ? "text-blue-700"
                                                    : "text-slate-800"
                                            }`}
                                        >
                                            {k.label}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {k.desc}
                                        </p>
                                    </button>
                                ))}
                            </div>
                            {selK === "Lainnya" && (
                                <div className="mb-5">
                                    <FInput
                                        label="Sebutkan jenis kendala Anda"
                                        required
                                        placeholder="Contoh: Jaringan tidak stabil saat video conference, sering disconnect setiap 30 menit..."
                                        value={otherText}
                                        onChange={setOtherText}
                                    />
                                </div>
                            )}
                            {selK && selK !== "Lainnya" && (
                                <div className="mb-5">
                                    <InfoBox type="info">
                                        Sistem memeriksa duplikasi... Tidak ada
                                        tiket aktif dengan kendala{" "}
                                        <strong>{selK}</strong> untuk OPD Anda.
                                    </InfoBox>
                                </div>
                            )}
                            <Btn
                                disabled={
                                    !selK ||
                                    (selK === "Lainnya" && !otherText.trim())
                                }
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
                                        selK === "Lainnya"
                                            ? otherText || "Lainnya"
                                            : selK
                                    }
                                    color="blue"
                                />
                            </div>
                            <h3 className="font-bold text-slate-800 mb-1">
                                Detail Pengaduan
                            </h3>
                            <p className="text-sm text-slate-400 mb-5">
                                Lengkapi informasi berikut agar Admin dapat
                                menindaklanjuti dengan cepat dan tepat.
                            </p>
                            <div className="bg-slate-50 rounded-xl p-4 mb-5 space-y-1">
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-2">
                                    Data Jaringan OPD (Profiling Sep 2026)
                                </p>
                                <p className="text-sm text-slate-600">
                                    OPD:{" "}
                                    <strong>
                                        Dinas Pendidikan dan Kebudayaan
                                    </strong>
                                </p>
                                <p className="text-sm text-slate-600">
                                    Koneksi: Fiber Optik · ISP: PT Telkom
                                    Indonesia · Bandwidth: 100 Mbps
                                </p>
                            </div>
                            <div className="space-y-4 mb-6">
                                <FTextarea
                                    label="Deskripsi Lengkap Kendala"
                                    required
                                    rows={5}
                                    placeholder="Jelaskan detail: kapan pertama terjadi, berapa sering, dampak pada pekerjaan, langkah yang sudah dicoba, lokasi ruangan yang terdampak, dll."
                                    value={desc}
                                    onChange={setDesc}
                                />
                                <FInput
                                    label="Narahubung / No. Telepon"
                                    placeholder="08xx-xxxx-xxxx"
                                    value={contact}
                                    onChange={setContact}
                                    hint="Nomor yang bisa dihubungi jika tim teknis perlu konfirmasi lebih lanjut"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Btn
                                    disabled={!desc.trim()}
                                    onClick={() => setDone(true)}
                                >
                                    <Ticket size={16} /> Ajukan Tiket
                                </Btn>
                                <Btn
                                    variant="secondary"
                                    onClick={() => setStep(0)}
                                >
                                    ← Kembali
                                </Btn>
                            </div>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}

// ─── Pantau Tiket ─────────────────────────────────────────────────────────────
function PantauTiket() {
    const [sel, setSel] = useState<(typeof ticketList)[0] | null>(null);
    return (
        <div>
            <PageHeader
                title="Pantau Tiket & Status"
                sub="Monitor status pengaduan jaringan dan riwayat penanganan"
            />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2 space-y-3">
                    {ticketList.map((t) => (
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
function DashboardVendor({ onNav }: { onNav: (s: Screen) => void }) {
    const [ticketStatuses] = useState<Record<string, string>>(() => {
        try {
            return JSON.parse(
                localStorage.getItem("siprojar.vendorTicketStatuses") ?? "{}",
            );
        } catch {
            return {};
        }
    });
    const [accepted] = useState<Record<string, boolean>>(() => {
        try {
            return JSON.parse(
                localStorage.getItem("siprojar.vendorAccepted") ?? "{}",
            );
        } catch {
            return {};
        }
    });
    const [rejected] = useState<Record<string, boolean>>(() => {
        try {
            return JSON.parse(
                localStorage.getItem("siprojar.vendorRejected") ?? "{}",
            );
        } catch {
            return {};
        }
    });
    const mine = ticketList
        .filter((ticket) => ticket.vendor === "CV Jaringan Sejahtera")
        .map((ticket) => ({
            ...ticket,
            status:
                ticketStatuses[ticket.id] ??
                (rejected[ticket.id]
                    ? "Ditolak"
                    : accepted[ticket.id] && ticket.status === "Diteruskan"
                      ? "Proses"
                      : ticket.status),
        }));
    return (
        <div className="space-y-6">
            <PageHeader
                title="Dashboard Vendor"
                sub="CV Jaringan Sejahtera · Ikhtisar penugasan tiket"
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                    label="Total Ditugaskan"
                    value={mine.length}
                    icon={<ClipboardList size={20} />}
                    color="blue"
                />
                <StatCard
                    label="Sedang Proses"
                    value={mine.filter((t) => t.status === "Proses").length}
                    icon={<Wrench size={20} />}
                    color="amber"
                />
                <StatCard
                    label="Selesai Bulan Ini"
                    value={mine.filter((t) => t.status === "Selesai").length}
                    icon={<CheckCircle2 size={20} />}
                    color="green"
                />
                <StatCard
                    label="Rata-rata Waktu"
                    value="2.4 hr"
                    icon={<FileClock size={20} />}
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
                {mine.map((t) => (
                    <div
                        key={t.id}
                        className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0"
                    >
                        <div
                            className={clx(
                                "w-2.5 h-2.5 rounded-full flex-shrink-0",
                                {
                                    Proses: "bg-amber-400",
                                    Selesai: "bg-green-500",
                                    Diteruskan: "bg-purple-500",
                                }[t.status] ?? "bg-slate-400",
                            )}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 text-sm">
                                {t.id} — {t.kendala}
                            </p>
                            <p className="text-xs text-slate-400">
                                {t.opd} · {t.tanggal}
                            </p>
                        </div>
                        {statusBadge(t.status)}
                    </div>
                ))}
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
export default function App() {
    const path = window.location.pathname;
    const initialRole: Role = path.includes("opd/dashboard") ? "opd" : "admin";
    const initialScreen: Screen = path.includes("dashboard")
        ? (`dashboard-${initialRole}` as Screen)
        : "login";
    const [screen, setScreen] = useState<Screen>(initialScreen);
    const [role, setRole] = useState<Role>(initialRole);
    const [userName, setUserName] = useState("");

    const handleLogin = (r: Role, name: string) => {
        setRole(r);
        setUserName(name);
        setScreen(
            {
                admin: "dashboard-admin",
                opd: "dashboard-opd",
                vendor: "dashboard-vendor",
            }[r] as Screen,
        );
    };
    const handleLogout = () => {
        setScreen("login");
        setUserName("");
    };
    const currentTitle =
        [...navItems.admin, ...navItems.opd, ...navItems.vendor].find(
            (i) => i.screen === screen,
        )?.label ?? "SIPROJAR";

    if (screen === "login") return <Login onLogin={handleLogin} />;

    const render = () => {
        switch (screen) {
            case "dashboard-admin":
                return <DashboardAdmin onNav={setScreen} />;
            case "master-opd":
                return <MasterOPD />;
            case "master-user":
                return <MasterUser />;
            case "form-profiling":
                return <FormProfiling onNav={setScreen} />;
            case "riwayat-profiling":
                return <RiwayatProfiling onNav={setScreen} />;
            case "verifikasi-profiling":
                return <VerifikasiProfiling />;
            case "kelola-tiket":
                return <KelolaTicket />;
            case "verifikasi-penanganan":
                return <VerifikasiPenanganan />;
            case "laporan":
                return <Laporan />;
            case "dashboard-opd":
                return <DashboardOPD onNav={setScreen} />;
            case "tiket-pengaduan":
                return <TiketPengaduan />;
            case "pantau-tiket":
                return <PantauTiket />;
            case "dashboard-vendor":
                return <DashboardVendor onNav={setScreen} />;
            case "tiket-masuk":
                return <TiketMasuk />;
            case "update-penanganan":
                return <UpdatePenanganan />;
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
                            {render()}
                        </div>
                    </main>
                </div>
                <BottomNav role={role} current={screen} onNav={setScreen} />
            </div>
        </GridBackground>
    );
}
