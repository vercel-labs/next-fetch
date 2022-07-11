import type { LoaderDefinition } from "webpack";
import { ReplaceSource, SourceMapSource } from "webpack-sources";
import { parseEndpointFile } from "./parseEndpointFile";

const loader: LoaderDefinition = function (
  content,
  sourcemaps,
  _additionalData
) {
  const source = new ReplaceSource(
    new SourceMapSource(
      content,
      this.resourcePath,
      typeof sourcemaps === "string" ? JSON.parse(sourcemaps) : sourcemaps
    )
  );

  const parsed = parseEndpointFile(content);
  for (const [start, end] of parsed.regionsToRemove) {
    source.replace(start, end, "");
  }

  let queriesCode = "{";
  for (const [name, { parserCode, callbackCode }] of Object.entries(
    parsed.queries
  )) {
    queriesCode += `${JSON.stringify(
      name
    )}: { parser: ${parserCode}, callback: ${callbackCode} },`;
  }
  queriesCode += "}";

  const output = `
    ${source.source()}

    const queries = ${queriesCode};
    const mutations = {};

    export default async (req, res) => {
      const query = queries[req.query.__query];
      delete req.query.__query;
      if (!query) {
        return res.status(400).send(\`Unknown query \${req.query.__query}. Available queries: \${Object.keys(queries).join(", ")}\`);
      }

      const { parser, callback } = query;
      let data;
      try {
        data = await (parser.parse ?? parser.parseAsync)(req.query);
      } catch (e) {
        return res.status(400).send(e.message);
      }

      const response = await callback(data);
      return res.send(JSON.stringify(response));
    };
  `;

  return output;
};

export default loader;
