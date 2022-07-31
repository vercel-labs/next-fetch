import type { LoaderDefinition } from "webpack";
import { SourceMapSource } from "webpack-sources";
import { cleanRegionsFromSource } from "./cleanRegionsFromSource";
import { parseEndpointFile, type Queries } from "./parseEndpointFile";

const loader: LoaderDefinition<{ nextRuntime?: "edge" | "nodejs" }> = function (
  content,
  sourcemaps,
  _additionalData
) {
  const { nextRuntime } = this.getOptions();
  const parsed = parseEndpointFile(content);
  const source = cleanRegionsFromSource(
    new SourceMapSource(
      content,
      this.resourcePath,
      typeof sourcemaps === "string" ? JSON.parse(sourcemaps) : sourcemaps
    ),
    parsed.regionsToRemove
  );

  const output = `
    ${source.source()}

    const queries = ${stringifyQueries(parsed.queries)};
    const mutations = ${stringifyQueries(parsed.mutations)};

    export default ${
      nextRuntime === "edge" ? getEdgeFunctionCode() : getNodejsCode()
    };
  `;

  return output;
};

function getNodejsCode() {
  return `
    async (req, res) => {
      const bag = req.method.toUpperCase() === 'POST' ? mutations : queries;
      const handler = bag.get(req.query.__handler);
      delete req.query.__handler;

      if (!handler) {
        return res
          .status(400)
          .send(\`Unknown handler \${req.query.__handler}. Available handlers: \${Object.keys(bag).join(", ")}\`);
      }

      const { parser, callback } = handler;
      let data;
      try {
        data = await (parser.parse ?? parser.parseAsync)(bag === mutations ? req.body : req.query);
      } catch (e) {
        return res.status(400).send(e.message);
      }

      const response = await callback(data);
      return res.send(JSON.stringify(response));
    }
  `.trim();
}

function getEdgeFunctionCode() {
  return `
    async (req) => {
      const url = req.nextUrl.clone();
      const bag = req.method.toUpperCase() === 'POST' ? mutations : queries;
      const handler = bag.get(url.searchParams.get('__handler'));
      url.searchParams.delete('__handler');

      if (!handler) {
        return new Response("unknown handler", { status: 400 });
      }

      const { parser, callback } = handler;

      try {
        data = await (parser.parse ?? parser.parseAsync)(bag === mutations ? req.body : req.query);
      } catch (e) {
        return new Response(e.message, { status: 500 });
      }

      const response = await callback(data);
      return __NextResponse__.json(response);
    };

    import { NextResponse as __NextResponse__ } from 'next/server';
  `;
}

function stringifyQueries(queries: Queries): string {
  const queryArrays = Object.entries(queries).map(
    ([name, { parserCode, callbackCode }]) => {
      return `[${JSON.stringify(
        name
      )}, { parser: ${parserCode}, callback: ${callbackCode} }]`;
    }
  );
  return `new Map([${queryArrays.join(", ")}])`;
}

export default loader;
