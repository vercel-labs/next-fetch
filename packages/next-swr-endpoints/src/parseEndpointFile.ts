import { parse } from "acorn";
import { simple } from "acorn-walk";

type ParsedQuery = {
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
      const rangesToKeep: [start: number, end: number][] = [];

      for (const declaration of node.declaration.declarations) {
        if (
          declaration.init.type === "CallExpression" &&
          ["query", "mutation"].includes(declaration.init.callee?.name)
        ) {
          const name = declaration.id;
          const [parser, callback] = declaration.init.arguments;
          const bag =
            "query" === declaration.init.callee.name ? queries : mutations;
          bag[content.slice(name.start, name.end)] = {
            parserCode: content.slice(parser.start, parser.end),
            callbackCode: content.slice(callback.start, callback.end),
          };
        } else if (declaration.id.name === "config") {
          rangesToKeep.push([declaration.start, declaration.end]);
        } else {
          errors.push(`Declaration at ${declaration.id.name} is wrong`);
        }
      }

      if (rangesToKeep.length) {
        const sorted = [...rangesToKeep].sort((a, z) => a[0] - z[0]);
        regionsToRemove.push([
          node.declaration.start + node.declaration.kind.length + 1,
          sorted[0][0] - 1,
        ]);
        regionsToRemove.push([
          sorted[sorted.length - 1][1],
          node.declaration.end,
        ]);
      } else {
        regionsToRemove.push([node.start, node.end]);
      }
    },
  });

  if (errors.length) {
    throw new Error(errors.join("\n"));
  }

  return { queries, regionsToRemove, mutations };
}
