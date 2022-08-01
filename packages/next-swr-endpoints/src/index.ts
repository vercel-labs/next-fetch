import type { SWRResponse } from "swr";
import type { SWRMutationResponse } from "swr/mutation";
import type { NextConfig } from "next";
import type { Parser } from "./types";

export function query<T, V>(
  parser: Parser<T>,
  callback: (parsed: T) => Promise<V>
): (v: T) => SWRResponse<V> {
  throw new Error("This code path should not be reached");
}

export function mutation<T, V>(
  parser: Parser<T>,
  callback: (parsed: T) => Promise<V>
): () => SWRMutationResponse<V, any, T> {
  throw new Error("This code path should not be reached");
}

export function withSwrApiEndpoints(given: NextConfig = {}): NextConfig {
  const pageExtensions = (
    given.pageExtensions ?? ["js", "jsx", "ts", "tsx"]
  ).flatMap((value) => {
    return [value, `api.${value}`, `swr.${value}`];
  });

  const escapedPageExtensions = pageExtensions.map((x) =>
    x.replace(/\\./g, "\\.")
  );
  const testRegex = new RegExp(
    `\\.(api|swr)\\.(${escapedPageExtensions.join("|")})$`
  );

  return {
    ...given,
    webpack(config, context) {
      config.module.rules.unshift({
        test: testRegex,
        ...(context.nextRuntime !== "edge" && { issuerLayer: "api" }),
        use: [
          {
            loader: "next-swr-endpoints/server-loader",
            options: { nextRuntime: context.nextRuntime },
          },
          context.defaultLoaders.babel,
        ],
      });
      config.module.rules.unshift({
        test: testRegex,
        use: [
          {
            loader: "next-swr-endpoints/client-loader",
            options: {
              projectDir: context.dir,
              pageExtensionsRegex: testRegex,
              basePath: context.config.basePath,
            },
          },
          context.defaultLoaders.babel,
        ],
      });
      return given.webpack ? given.webpack(config, context) : config;
    },
    pageExtensions,
  };
}
