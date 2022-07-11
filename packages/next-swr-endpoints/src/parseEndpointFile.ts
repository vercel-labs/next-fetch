import { parse } from "acorn";
import { simple } from "acorn-walk";

export type ParsedQuery = {
  parserCode: string;
  callbackCode: string;
};
export type Queries = { [name: string]: ParsedQuery };
export function parseEndpointFile(content: string): {
  queries: Queries;
  mutations: Queries;
  regionsToRemove: [start: number, end: number][];
} {
  const ast = parse(content, { ecmaVersion: "latest", sourceType: "module" });
  const errors: string[] = [];
  const queries: Queries = {};
  const mutations: Queries = {};
  const regionsToRemove: [start: number, end: number][] = [];
  simple(ast, {
    ExportNamedDeclaration(node: any) {
      for (const declaration of node.declaration.declarations) {
        const calleeName = declaration.init?.calle?.name;
        if (
          declaration.init.type === "CallExpression" &&
          ["query", "mutation"].includes(calleeName)
        ) {
          const name = declaration.id;
          const [parser, callback] = declaration.init.arguments;

          const bag = calleeName === "query" ? queries : mutations;

          bag[content.slice(name.start, name.end)] = {
            parserCode: content.slice(parser.start, parser.end),
            callbackCode: content.slice(callback.start, callback.end),
          };

          break;
        }

        errors.push(`Declaration at ${declaration.id.name} is wrong`);
      }

      regionsToRemove.push([node.start, node.end]);
    },
  });

  if (errors.length) {
    throw new Error(errors.join("\n"));
  }

  return { queries, mutations, regionsToRemove };
}
