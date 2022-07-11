import type { LoaderDefinition } from "webpack";
import { ReplaceSource, SourceMapSource } from "webpack-sources";
import { parseEndpointFile, type Queries } from "./parseEndpointFile";

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

  const queriesCode = stringifyQueries(parsed.queries);
  const mutationsCode = stringifyQueries(parsed.mutations);

  const output = `
    ${source.source()}

    const queries = ${queriesCode};
    const mutations = ${mutationsCode};

    export default async (req, res) => {
      const bag = req.method === "POST" ? mutations : queries;
      const bagName = bag === mutations ? 'mutation' : 'query';
      const bagNamePlural = bag === mutations ? 'mutations' : 'queries';

      const query = bag.get(req.query.__query);
      delete req.query.__query;
      if (!query) {
        const available = [...bag.keys()]
        return res.status(400).send(\`Unknown \${bagName} \${req.query.__query}. Available \${bagNamePlural}: \${available.join(", ")}\`);
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
