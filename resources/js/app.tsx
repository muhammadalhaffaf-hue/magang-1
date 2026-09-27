import "../css/app.css";
import "./bootstrap";

import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { FloatingPathsBackground } from "./Components/FloatingPathsBackground";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

createInertiaApp({
    title: (title: string) => `${title} - ${appName}`,
    resolve: (name: string) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob("./Pages/**/*.tsx"),
        ).then((module: any) => module.default || module),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <FloatingPathsBackground position={-1}>
                <App {...props} />
            </FloatingPathsBackground>,
        );
    },
});
