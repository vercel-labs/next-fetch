import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: {
    resolve: [/@next-fetch\/core-plugin/],
  },
  entry: [
    "src/index.ts",
    "src/swr-client-endpoint-loader.ts",
    "src/swr-server-endpoint-loader.ts",
    "src/client.ts",
    "src/server.ts",
    "src/form.ts",
  ],
  external: ["next/server", "swr", "swr/mutation", "react"],
  format: ["cjs", "esm"],
  minify: process.env.NODE_ENV === "production",
  sourcemap: true,
  target: "esnext",
});
