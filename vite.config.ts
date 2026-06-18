import { resolve } from "path";
import dts from "vite-plugin-dts";
import { configDefaults, defineConfig } from "vitest/config";

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
    },
});
