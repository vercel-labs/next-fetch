import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: [
    "src/index.ts",
    "src/swr-client-endpoint-loader.ts",
    "src/swr-server-endpoint-loader.ts",
    "src/client.ts",
    "src/server.ts",
  ],
  external: ["next/server"],
  format: ["cjs", "esm"],
  minify: process.env.NODE_ENV === "production",
  sourcemap: true,
  target: "node16",
});
