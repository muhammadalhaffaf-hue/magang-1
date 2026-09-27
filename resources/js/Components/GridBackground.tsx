import { motion } from "motion/react";
import type { ReactNode } from "react";

export function GridBackground({ children }: { children: ReactNode }) {
    return (
        <div className="relative min-h-screen overflow-x-clip bg-slate-50">
            {/* Wrapper SVG Grid */}
            <div
                className="pointer-events-none absolute inset-0 opacity-70"
                aria-hidden="true"
            >
                <svg
                    className="h-full w-full"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        {/* 1. Masking untuk Area Pojok Kanan Atas (Warna Ungu) */}
                        <radialGradient
                            id="top-right-mask"
                            cx="100%"
                            cy="0%"
                            r="70%"
                        >
                            <stop
                                offset="0%"
                                stopColor="white"
                                stopOpacity="1"
                            />
                            <stop
                                offset="100%"
                                stopColor="white"
                                stopOpacity="0"
                            />
                        </radialGradient>

                        {/* 2. Masking untuk Area Bagian Bawah (Warna Biru) */}
                        <radialGradient
                            id="bottom-mask"
                            cx="50%"
                            cy="100%"
                            r="80%"
                        >
                            <stop
                                offset="0%"
                                stopColor="white"
                                stopOpacity="1"
                            />
                            <stop
                                offset="100%"
                                stopColor="white"
                                stopOpacity="0"
                            />
                        </radialGradient>

                        <mask id="mask-purple">
                            <rect
                                width="100%"
                                height="100%"
                                fill="url(#top-right-mask)"
                            />
                        </mask>

                        <mask id="mask-blue">
                            <rect
                                width="100%"
                                height="100%"
                                fill="url(#bottom-mask)"
                            />
                        </mask>

                        {/* Pola Garis Grid Solid (Ukuran Kotak 40x40) */}
                        <pattern
                            id="grid-pattern-purple"
                            width="40"
                            height="40"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M 40 0 L 0 0 0 40"
                                fill="none"
                                stroke="#9333ea" // Garis Grid Ungu
                                strokeWidth="1.2"
                            />
                        </pattern>

                        <pattern
                            id="grid-pattern-blue"
                            width="40"
                            height="40"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M 40 0 L 0 0 0 40"
                                fill="none"
                                stroke="#2563eb" // Garis Grid Biru
                                strokeWidth="1.2"
                            />
                        </pattern>
                    </defs>

                    {/* Layer 1: Grid Ungu di Pojok Kanan Atas (Bergerak Diagonal ke Kanan Atas) */}
                    <motion.rect
                        width="100%"
                        height="100%"
                        fill="url(#grid-pattern-purple)"
                        mask="url(#mask-purple)"
                        animate={{
                            x: [0, 40],
                            y: [0, -40],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                    />

                    {/* Layer 2: Grid Biru di Bagian Bawah (Bergerak Diagonal ke Kanan Atas) */}
                    <motion.rect
                        width="100%"
                        height="100%"
                        fill="url(#grid-pattern-blue)"
                        mask="url(#mask-blue)"
                        animate={{
                            x: [0, 40],
                            y: [0, -40],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                    />
                </svg>
            </div>

            {/* Konten Utama */}
            <div className="relative z-10">{children}</div>
        </div>
    );
}
