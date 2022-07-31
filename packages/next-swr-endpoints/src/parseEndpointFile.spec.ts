import { parseEndpointFile } from "./parseEndpointFile";
import { test, expect } from "vitest";
import { RawSource, ReplaceSource } from "webpack-sources";
import prettier from "prettier";

test("does not remove config export", () => {
  const input = `
    import { query, mutation } from 'next-swr-endpoints';

    export const useMyQuery = query({}, () => "Hello")
      , config = {
          runtime: 'experimental-edge'
        }
      , useMyMutation = mutation({}, () => "My mutation");

    export const useMyOtherQuery = query({}, () => "Hello World");
  `.trim();
  const source = new ReplaceSource(new RawSource(input));

  const result = parseEndpointFile(input);

  for (const [start, end] of result.regionsToRemove) {
    source.replace(start, end, "");
  }

  expect(result.queries).toEqual<typeof result["queries"]>({
    useMyOtherQuery: {
      callbackCode: `() => "Hello World"`,
      parserCode: `{}`,
    },
    useMyQuery: {
      callbackCode: `() => "Hello"`,
      parserCode: `{}`,
    },
  });

  console.log(source.source());

  expect(prettier.format(source.source(), { parser: "babel" }).trim())
    .toMatchInlineSnapshot(`
      "import { query, mutation } from \\"next-swr-endpoints\\";

      export const config = {
        runtime: \\"experimental-edge\\",
      };"
    `);
});
