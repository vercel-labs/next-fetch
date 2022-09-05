import type { SWRResponse } from "swr";
import type { SWRMutationResponse } from "swr/mutation";
import type { Parser } from "@next-fetch/core-plugin/parser";
import type { HookMetadata } from "@next-fetch/core-plugin/client";
import type {
  HandlerCallback,
  HookIntoResponse,
} from "@next-fetch/core-plugin/server";
import { createPlugin } from "@next-fetch/core-plugin";
import type { NextConfig } from "next";

export type QueryResult<Input, Output> = ((v: Input) => SWRResponse<Output>) & {
  meta: HookMetadata;
};

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

export type MutationOptions<Output> = HookIntoResponse<Output>;
export type MutationResult<Input, Output> = (() => SWRMutationResponse<
  Output,
  any,
  Input
> & { meta: HookMetadata }) & {
  meta: HookMetadata;
};

export function mutation<Output>(
  callback: HandlerCallback<void, Output>,
  options?: Partial<MutationOptions<Output>>
): MutationResult<void, Output>;
export function mutation<Input, Output>(
  parser: Parser<Input>,
  callback: HandlerCallback<Input, Output>,
  options?: Partial<MutationOptions<Output>>
): MutationResult<Input, Output>;
export function mutation(): unknown {
  throw new Error("This code path should not be reached");
}

export function withSwrApiEndpoints(given: NextConfig = {}): NextConfig {
  return createPlugin({
    capturedExtensions: ["swr"],
    clientLoaderPath: "@next-fetch/swr/client-loader",
    serverLoaderPath: "@next-fetch/swr/server-loader",
    clientPackageName: "@next-fetch/swr/client",
    serverPackageName: "@next-fetch/swr/server",
  })(given);
}

export type inputOf<
  T extends MutationResult<any, any> | QueryResult<any, any>
> = T extends MutationResult<infer Input, any>
  ? Input
  : T extends QueryResult<infer Input, any>
  ? Input
  : never;
export type outputOf<
  T extends MutationResult<any, any> | QueryResult<any, any>
> = T extends MutationResult<any, infer Output>
  ? Output
  : T extends QueryResult<any, infer Output>
  ? Output
  : never;
