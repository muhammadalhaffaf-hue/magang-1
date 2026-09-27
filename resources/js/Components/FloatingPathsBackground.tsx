import { motion } from "motion/react";
import type { ReactNode } from "react";

// 1. Path Utama (Pojok Kiri Bawah)
const yShift = 50;

const mainPaths = Array.from({ length: 28 }, (_, index) => {
    const position = -1;
    const offset = 380 - index * 5 * position;
    const y = 189 + index * 6 + yShift;

    return {
        id: index,
        d: `M-${offset} -${y}C-${offset} -${y} -${312 - index * 5 * position} ${216 - index * 6 + yShift} ${152 - index * 5 * position} ${343 - index * 6 + yShift}C${616 - index * 5 * position} ${470 - index * 6 + yShift} ${684 - index * 5 * position} ${875 - index * 6 + yShift} ${684 - index * 5 * position} ${875 - index * 6 + yShift}`,
        color: index % 2 === 0 ? "#1d4ed8" : "#2563eb",
        width: 1.2 + index * 0.04,
    };
});

// 2. Path Pojok Kanan Atas (Pola Kurva Sama dengan Main Paths, Dirotasi/Digeser ke Kanan Atas)
const topRightPaths = Array.from({ length: 28 }, (_, index) => {
    const position = -1;
    const offset = 200 - index * 5 * position;
    const y = 300 + index * 6;

    return {
        id: index + 100,
        // Formula kurva disesuaikan agar membentuk lengkungan melengkung ke atas kanan
        d: `M${100 + offset} -${y}C${100 + offset} -${y} ${200 + index * 5} -${y - 100} ${450 + index * 5} ${50 - index * 6}C${650 + index * 5} ${150 - index * 6} ${800 + index * 5} ${400 - index * 6} ${800 + index * 5} ${400 - index * 6}`,
        color: index % 2 === 0 ? "#2563eb" : "#60a5fa",
        width: 1.0 + index * 0.04,
    };
});

export function FloatingPathsBackground({
    position = -1,
    children,
    className = "",
}: {
    position?: number;
    children: ReactNode;
    className?: string;
}) {
    const allPaths = [...mainPaths, ...topRightPaths];

    return (
        <div className={`relative min-h-screen overflow-x-clip ${className}`}>
            <div
                className="floating-paths pointer-events-none absolute inset-0"
                aria-hidden="true"
            >
                <svg
                    className="h-full w-full"
                    viewBox="0 0 696 316"
                    fill="none"
                    preserveAspectRatio="xMidYMid slice"
                >
                    {allPaths.map((path) => (
                        <motion.path
                            key={path.id}
                            d={path.d}
                            stroke={path.color}
                            strokeWidth={path.width}
                            strokeOpacity={0.25 + (path.id % 30) * 0.02}
                            initial={{ pathLength: 1, pathOffset: 0 }}
                            animate={{
                                pathLength: 1,
                                pathOffset: [0, 1, 0],
                            }}
                            transition={{
                                // Durasi dipercepat dari 32s ke 14s - 20s
                                duration: 20 + (path.id % 7),
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "linear",
                            }}
                        />
                    ))}
                </svg>
            </div>
            <div className="relative z-10">{children}</div>
        </div>
    );
}
