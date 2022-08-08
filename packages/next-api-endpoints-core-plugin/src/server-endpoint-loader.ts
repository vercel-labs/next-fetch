import type { LoaderDefinition } from "webpack";
import { SourceMapSource } from "webpack-sources";
import { cleanRegionsFromSource } from "./cleanRegionsFromSource";
import { parseEndpointFile, type Queries } from "./parseEndpointFile";

export type ServerLoaderOptions = {
  nextRuntime?: "edge" | "nodejs";
  serverPackageName: string;
};

const loader: LoaderDefinition<ServerLoaderOptions> = function (
  content,
  sourcemaps,
  _additionalData
) {
  const { nextRuntime, serverPackageName } = this.getOptions();
  const parsed = parseEndpointFile(content);
  const source = cleanRegionsFromSource(
    new SourceMapSource(
      content,
      this.resourcePath,
      typeof sourcemaps === "string" ? JSON.parse(sourcemaps) : sourcemaps
    ),
    parsed.regionsToRemove
  );

  const handler = (
    nextRuntime === "edge" ? getEdgeFunctionCode : getNodejsCode
  )(serverPackageName);

  const output = `
    ${source.source()}

    /**/;

    const queries = ${stringifyQueries(parsed.queries)};
    const mutations = ${stringifyQueries(parsed.mutations)};

    export default ${handler}
  `;

  return output;
};

function getNodejsCode(serverPackageName: string) {
  return `
    async (req, res) => handleNodejsFunction({ queries, mutations, req, res });
    import { handleNodejsFunction } from ${JSON.stringify(serverPackageName)};
  `.trim();
}

function getEdgeFunctionCode(serverPackageName: string) {
  return `
    async (request) => handleEdgeFunction({ queries, mutations, request });
    import { handleEdgeFunction } from ${JSON.stringify(serverPackageName)};
  `.trim();
}

function stringifyQueries(queries: Queries): string {
  const queryArrays = Object.entries(queries).map(
    ([name, { parserCode, callbackCode, optionsCode }]) => {
      return `[${JSON.stringify(
        name
      )}, { parser: ${parserCode}, callback: ${callbackCode}, options: ${
        optionsCode ?? "{}"
      } }]`;
    }
  );
  return `new Map([${queryArrays.join(", ")}])`;
}

export default loader;
