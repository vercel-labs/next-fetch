import type { LoaderDefinition } from "webpack";
import { parseEndpointFile } from "./parseEndpointFile";
import { ConcatSource, OriginalSource, SourceMapSource } from "webpack-sources";
import path from "path";
import { cleanRegionsFromSource } from "./cleanRegionsFromSource";

const loader: LoaderDefinition<{
  projectDir: string;
  pageExtensionsRegex: RegExp;
  basePath: string;
}> = function (content, sourcemaps, additionalData) {
  const { projectDir, pageExtensionsRegex, basePath } = this.getOptions();
  const originalSource =
    typeof sourcemaps === "undefined"
      ? new OriginalSource(content, this.resourcePath)
      : new SourceMapSource(
          content,
          this.resourcePath,
          typeof sourcemaps === "string" ? JSON.parse(sourcemaps) : sourcemaps
        );
  const parsed = parseEndpointFile(content);
  const source = cleanRegionsFromSource(originalSource, parsed.regionsToRemove);

  const resource = path
    .relative(projectDir, this.resourcePath)
    .replace(/^(src\/)?pages\//, "")
    .replace(pageExtensionsRegex, "");
  const apiPage = `${basePath}/${resource}`;

  const queryExports = Object.keys(parsed.queries).map((name) => {
    return `
      export function ${name}(arg, opts = {}) {
        const searchParams = new URLSearchParams(arg);
        searchParams.set('__handler', ${JSON.stringify(name)});
        return useSWR(${JSON.stringify(
          apiPage
        )} + '?' + searchParams.toString(), {
          fetcher: __queryFetcher,
          ...opts,
        });
      }
    `;
  });

  const mutationExports = Object.keys(parsed.mutations).map((name) => {
    return `
      export function ${name}(opts = {}) {
        const searchParams = new URLSearchParams();
        searchParams.set('__handler', ${JSON.stringify(name)});
        return useSWRMutation(${JSON.stringify(
          apiPage
        )} + '?' + searchParams.toString(), {
          fetcher: __mutationFetcher,
          ...opts,
        });
      }
    `;
  });

  const queryFetcher = `
    async function __queryFetcher(url) {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Response with status \${response.status} is not ok.");
      }
      return response.json();
    }
  `;

  const mutationFetcher = `
    async function __mutationFetcher(url, { arg }) {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(arg),
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      })
      if (!response.ok) {
        throw new Error("Response with status \${response.status} is not ok.");
      }
      return response.json();
    }
  `;

  const concat = new ConcatSource(
    source,
    `\n/**/;`,
    'import useSWR from "swr";',
    'import useSWRMutation from "swr/mutation";',
    queryFetcher,
    mutationFetcher,
    queryExports.join("\n\n"),
    mutationExports.join("\n\n")
  );

  const { source: outputCode, map: outputSourceMap } = concat.sourceAndMap();
  this.callback(null, outputCode, outputSourceMap ?? undefined, additionalData);
};

export default loader;
