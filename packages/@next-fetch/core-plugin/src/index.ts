import type { NextConfig } from "next";
import type { Configuration } from "webpack";
import type { ClientLoaderOptions } from "./client-endpoint-loader";
import type { ServerLoaderOptions } from "./server-endpoint-loader";

export function createPlugin(opts: {
  clientPackageName: string;
  clientLoaderPath: string;
  serverPackageName: string;
  serverLoaderPath: string;
  capturedExtensions: string[];
}): (given?: NextConfig) => NextConfig {
  return (given = {}) => {
    const pageExtensions = (
      given.pageExtensions ?? ["js", "jsx", "ts", "tsx"]
    ).flatMap((value) => {
      return [
        value,
        ...opts.capturedExtensions.map((extension) => {
          return `${extension}.${value}`;
        }),
      ];
    });

    const escapedCapturedExtensions = opts.capturedExtensions
      .map((extension) => extension.replace(/\./g, "\\."))
      .join("|");
    const escapedPageExtensions = pageExtensions
      .map((x) => x.replace(/\\./g, "\\."))
      .join("|");
    const testRegex = new RegExp(
      `\\.(${escapedCapturedExtensions})\\.(${escapedPageExtensions})$`
    );

    return {
      ...given,
      webpack(config: Configuration, context) {
        const serverLoaderOptions: ServerLoaderOptions = {
          nextRuntime: context.nextRuntime,
          serverPackageName: opts.serverPackageName,
        };
        config.module?.rules?.unshift({
          test: testRegex,
          issuerLayer: { or: ["api", "middleware"] },
          use: [
            {
              loader: opts.serverLoaderPath,
              options: serverLoaderOptions,
            },
            context.defaultLoaders.babel,
          ],
        });

        const clientLoaderOptions: ClientLoaderOptions = {
          projectDir: context.dir,
          pageExtensionsRegex: testRegex,
          basePath: context.config.basePath,
          clientPackageName: opts.clientPackageName,
        };

        config.module?.rules?.unshift({
          test: testRegex,
          issuerLayer: { not: { or: ["api", "middleware"] } },
          use: [
            {
              loader: opts.clientLoaderPath,
              options: clientLoaderOptions,
            },
            context.defaultLoaders.babel,
          ],
        });
        return given.webpack ? given.webpack(config, context) : config;
      },
      pageExtensions,
    };
  };
}
