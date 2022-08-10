import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: {
    resolve: [/next-api-endpoints-core-plugin/],
  },
  entry: [
    "src/index.ts",
    "src/client-endpoint-loader.ts",
    "src/server-endpoint-loader.ts",
    "src/client.ts",
    "src/server.ts",
    "src/form.ts",
  ],
  external: ["next/server", "@tanstack/react-query", "react"],
  format: ["cjs", "esm"],
  minify: process.env.NODE_ENV === "production",
  sourcemap: true,
  target: "esnext",
});
