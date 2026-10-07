import type { ComponentProps, ReactNode } from "react";

type BorderBeamProps = Omit<ComponentProps<"div">, "children"> & {
    children: ReactNode;
    color?: string;
    length?: number;
    thickness?: number;
    speed?: number;
    delay?: number;
};

function BorderBeam({
    color = "#3b82f6", // Warna biru
    length = 20,
    thickness = 2,
    speed = 8,
    delay = 0,
    className,
    style,
    children,
    ...props
}: BorderBeamProps) {
    return (
        <div
            data-slot="border-beam"
            className={[
                "relative isolate rounded-xl bg-blue-500/15 border border-blue-500/30 backdrop-blur-sm p-4",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
            style={style}
            {...props}
        >
            {children}
            <span
                aria-hidden="true"
                className="border-beam-ring"
                style={{
                    background: `conic-gradient(from var(--border-beam-angle), transparent, ${color} ${length}%, transparent calc(${length}% * 1.2))`,
                    padding: thickness,
                    animationDuration: `${speed}s`,
                    animationDelay: `${delay}s`,
                    WebkitMask:
                        "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "exclude",
                }}
            />
        </div>
    );
}

export { BorderBeam };
export type { BorderBeamProps };
