import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import type { Parser } from "@next-fetch/core-plugin/parser";
import type {
  HandlerCallback,
  HookIntoResponse,
} from "@next-fetch/core-plugin/server";
import type { NextConfig } from "next";
import type { HookMetadata } from "@next-fetch/core-plugin/client";
import { createPlugin } from "@next-fetch/core-plugin";

export type QueryResult<Input, Output> = (v: Input) => UseQueryResult<Output>;
export type MutationResult<Input, Output> = () => UseMutationResult<
  Output,
  any,
  Input
> & { meta: HookMetadata };

export function query<Output>(
  callback: HandlerCallback<void, Output>,
  options?: Partial<HookIntoResponse<Output>>
): QueryResult<void, Output>;
export function query<Input, Output>(
  parser: Parser<Input>,
  callback: HandlerCallback<Input, Output>,
  options?: Partial<HookIntoResponse<Output>>
): QueryResult<Input, Output>;
export function query(): unknown {
  throw new Error("This code path should not be reached");
}

export function mutation<Output>(
  callback: HandlerCallback<void, Output>,
  options?: Partial<HookIntoResponse<Output>>
): MutationResult<void, Output>;
export function mutation<Input, Output>(
  parser: Parser<Input>,
  callback: HandlerCallback<Input, Output>,
  options?: Partial<HookIntoResponse<Output>>
): MutationResult<Input, Output>;
export function mutation(): unknown {
  throw new Error("This code path should not be reached");
}

export function withReactQueryApiEndpoints(given: NextConfig = {}): NextConfig {
  return createPlugin({
    capturedExtensions: ["rq"],
    clientLoaderPath: "@next-fetch/react-query/client-loader",
    serverLoaderPath: "@next-fetch/react-query/server-loader",
    clientPackageName: "@next-fetch/react-query/client",
    serverPackageName: "@next-fetch/react-query/server",
  })(given);
}

/**
 * Retrieves the type of the input of a given query/mutation hook
 */
export type inputOf<
  T extends QueryResult<any, any> | MutationResult<any, any>
> = T extends MutationResult<infer Input, any>
  ? Input
  : T extends QueryResult<infer Input, any>
  ? Input
  : never;

/**
 * Retrieves the type of the output of a given query/mutation hook
 */
export type outputOf<
  T extends QueryResult<any, any> | MutationResult<any, any>
> = T extends MutationResult<any, infer Output>
  ? Output
  : T extends QueryResult<any, infer Output>
  ? Output
  : never;
