import type { SWRResponse } from "swr";
import type { SWRMutationResponse } from "swr/mutation";
import type { NextConfig } from "next";
import type { Parser } from "./parser";
import type { Configuration } from "webpack";
import type { HandlerCallback, HookIntoResponse } from "./server";
import { HookMetadata } from "./client";

export type QueryOptions<Output> = HookIntoResponse<Output>;

export function query<Input, Output>(
  parser: Parser<Input>,
  callback: HandlerCallback<Input, Output>,
  options?: Partial<HookIntoResponse<Output>>
): ((v: Input) => SWRResponse<Output>) & { meta: HookMetadata } {
  throw new Error("This code path should not be reached");
}

export type MutationOptions<Output> = HookIntoResponse<Output>;

export function mutation<Input, Output>(
  parser: Parser<Input>,
  callback: HandlerCallback<Input, Output>,
  options?: Partial<MutationOptions<Output>>
): (() => SWRMutationResponse<Output, any, Input> & { meta: HookMetadata }) & {
  meta: HookMetadata;
} {
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
    webpack(config: Configuration, context) {
      config.module?.rules?.unshift({
        test: testRegex,
        issuerLayer: { or: ["api", "middleware"] },
        use: [
          {
            loader: "next-swr-endpoints/server-loader",
            options: { nextRuntime: context.nextRuntime },
          },
          context.defaultLoaders.babel,
        ],
      });
      config.module?.rules?.unshift({
        test: testRegex,
        issuerLayer: { not: { or: ["api", "middleware"] } },
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
