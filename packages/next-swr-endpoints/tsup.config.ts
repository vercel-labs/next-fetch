import { defineConfig } from "tsup";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  clean: true,
  dts: true,
  entry: [
    "src/index.ts",
    "src/swr-client-endpoint-loader.ts",
    "src/swr-server-endpoint-loader.ts",
  ],
  format: ["cjs"],
  minify: isProduction,
  sourcemap: true,
  target: "node16",
});
