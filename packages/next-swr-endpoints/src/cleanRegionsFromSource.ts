import { ReplaceSource, type Source } from "webpack-sources";

export type Region = [start: number, end: number];

export function cleanRegionsFromSource(
  input: Source,
  regionsToRemove: Region[]
): ReplaceSource {
  const source = new ReplaceSource(input);
  for (const [start, end] of regionsToRemove) {
    source.replace(start, end, "");
  }
  return source;
}
