import { parse } from "acorn";
import { simple } from "acorn-walk";

type ParsedQuery = {
  parserCode: string;
  callbackCode: string;
};
type Queries = { [name: string]: ParsedQuery };
export function parseEndpointFile(content: string): {
  queries: Queries;
  regionsToRemove: [start: number, end: number][];
} {
  const ast = parse(content, { ecmaVersion: "latest", sourceType: "module" });
  const errors: string[] = [];
  const queries: Queries = {};
  const regionsToRemove: [start: number, end: number][] = [];
  simple(ast, {
    ExportNamedDeclaration(node: any) {
      for (const declaration of node.declaration.declarations) {
        if (
          declaration.init.type === "CallExpression" &&
          declaration.init.callee?.name === "query"
        ) {
          const name = declaration.id;
          const [parser, callback] = declaration.init.arguments;
          queries[content.slice(name.start, name.end)] = {
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

  return { queries, regionsToRemove };
}
