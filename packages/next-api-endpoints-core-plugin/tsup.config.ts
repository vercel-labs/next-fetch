import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: [
    "src/index.ts",
    "src/client-endpoint-loader.ts",
    "src/server-endpoint-loader.ts",
    "src/client.ts",
    "src/server.ts",
  ],
  external: ["next/server", "next"],
  format: ["cjs", "esm"],
  minify: process.env.NODE_ENV === "production",
  sourcemap: true,
  target: "esnext",
});
