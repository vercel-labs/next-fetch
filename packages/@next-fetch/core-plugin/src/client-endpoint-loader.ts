import type { LoaderDefinition } from "webpack";
import { parseEndpointFile } from "./parseEndpointFile";
import { ConcatSource } from "webpack-sources";
import path from "path";

export type ClientLoaderOptions = {
  projectDir: string;
  pageExtensionsRegex: RegExp;
  basePath: string;
  clientPackageName: string;
};

const loader: LoaderDefinition<ClientLoaderOptions> = function (
  content,
  _sourcemaps,
  additionalData
) {
  const { projectDir, pageExtensionsRegex, basePath, clientPackageName } =
    this.getOptions();
  const parsed = parseEndpointFile(content);

  const resource = path
    .relative(projectDir, this.resourcePath)
    .replace(/^(src\/)?pages\//, "")
    .replace(pageExtensionsRegex, "");
  const apiPage = `${basePath}/${resource}`;

  const queryExports = Object.keys(parsed.queries).map((name) => {
    return `
      export const ${name} =
        /*#__PURE__*/ createQueryHook(API_PAGE, ${JSON.stringify(name)});
    `;
  });

  const mutationExports = Object.keys(parsed.mutations).map((name) => {
    return `
      export const ${name} =
        /*#__PURE__*/ createMutationHook(API_PAGE, ${JSON.stringify(name)});
    `;
  });

  const concat = new ConcatSource(
    `import { createQueryHook, createMutationHook } from ${JSON.stringify(
      clientPackageName
    )};`,
    `const API_PAGE = ${JSON.stringify(apiPage)};`,
    queryExports.join("\n\n"),
    mutationExports.join("\n\n")
  );

  const { source: outputCode, map: outputSourceMap } = concat.sourceAndMap();
  this.callback(null, outputCode, outputSourceMap ?? undefined, additionalData);
};

export default loader;
