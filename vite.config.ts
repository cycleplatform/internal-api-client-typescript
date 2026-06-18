import { builtinModules } from "module";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import { configDefaults, defineConfig } from "vitest/config";
import pkg from "./package.json" with { type: "json" };

// Everything in dependencies must be resolved at runtime, not bundled.
// undici in particular breaks if inlined (it relies on Node internals like
// util.debuglog that do not survive bundling).
const external = [
    ...Object.keys(pkg.dependencies ?? {}),
    ...builtinModules,
    ...builtinModules.map((m) => `node:${m}`),
];

export default defineConfig({
    plugins: [
        dts({
            include: ["src"],
            exclude: ["tests", "**/*.test.ts"],
        }),
    ],
    test: {
        exclude: [...configDefaults.exclude, "packages/template/*"],
        setupFiles: ["./tests/setup.ts"],
    },
    build: {
        lib: {
            entry: resolve(__dirname, "./src/index.ts"),
            name: "CycleInternalApiClient",
            fileName: "index",
        },
        rollupOptions: {
            external,
        },
    },
});
