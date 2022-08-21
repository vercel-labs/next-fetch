/**
 * An object that can parse an unknown value into a known value.
 * If parsing fails, it is expected to throw an error.
 * This adheres to `zod`'s interface, so any Zod type can be used as a parser,
 * but any parsing library can be used with a given adapter.
 */
export type Parser<Into> =
  | { parse(arg: unknown): Into }
  | { parseAsync(arg: unknown): Promise<Into> };

export function parse<T>(parser: Parser<T>, data: unknown): Promise<T> {
  return Promise.resolve(
    ("parseAsync" in parser ? parser.parseAsync : parser.parse)(data)
  );
}
