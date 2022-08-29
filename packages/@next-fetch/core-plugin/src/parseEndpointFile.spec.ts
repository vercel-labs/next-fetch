import { parseEndpointFile } from "./parseEndpointFile";
import { test, expect } from "vitest";
import { RawSource } from "webpack-sources";
import prettier from "prettier";
import { cleanRegionsFromSource } from "./cleanRegionsFromSource";

test("finds all the exported handlers", () => {
  const input = `
    import { query, mutation } from 'my-pkg';

    export const useMyQuery = query({}, () => "Hello", { something: 'else' })
      , config = {
          runtime: 'experimental-edge'
        }
      , useMyMutation = mutation(
          {},
          () => "My mutation",
          { hookResponse: () => Response.redirect("/") }
        );

    export const useMyOtherQuery = query({}, () => "Hello World");
  `.trim();

  const result = parseEndpointFile(input);

  expect(result).toEqual<typeof result>({
    regionsToRemove: expect.any(Array),
    mutations: {
      useMyMutation: {
        callbackCode: `() => "My mutation"`,
        parserCode: `{}`,
        optionsCode: `{ hookResponse: () => Response.redirect("/") }`,
      },
    },
    queries: {
      useMyOtherQuery: {
        callbackCode: `() => "Hello World"`,
        parserCode: `{}`,
      },
      useMyQuery: {
        callbackCode: `() => "Hello"`,
        parserCode: `{}`,
        optionsCode: `{ something: 'else' }`,
      },
    },
  });

  const formattedCode = prettier
    .format(
      cleanRegionsFromSource(
        new RawSource(input),
        result.regionsToRemove
      ).source(),
      { parser: "babel" }
    )
    .trim();

  expect(formattedCode).toMatchInlineSnapshot(`
      "import { query, mutation } from \\"my-pkg\\";"
    `);
});
