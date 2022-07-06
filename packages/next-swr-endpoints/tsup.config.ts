import { defineConfig } from "tsup";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    index: "src/index.ts",
    swrClientEndpointLoader: "src/swr-client-endpoint-loader.ts",
    swrServerEndpointLoader: "src/swr-server-endpoint-loader.ts",
  },
  format: ["cjs"],
  minify: isProduction,
  sourcemap: true,
  target: "node16",
});
