export type Parser<Into> =
  | { parse(arg: unknown): Into }
  | { parseAsync(arg: unknown): Promise<Into> };
