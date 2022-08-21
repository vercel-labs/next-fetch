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

export function query<Input, Output>(
  parser: Parser<Input>,
  callback: HandlerCallback<Input, Output>,
  options?: Partial<HookIntoResponse<Output>>
): ((v: Input) => SWRResponse<Output>) & { meta: HookMetadata } {
  throw new Error("This code path should not be reached");
}

export type MutationOptions<Output> = HookIntoResponse<Output>;

export function mutation<Input, Output>(
  parser: Parser<Input>,
  callback: HandlerCallback<Input, Output>,
  options?: Partial<MutationOptions<Output>>
): (() => SWRMutationResponse<Output, any, Input> & { meta: HookMetadata }) & {
  meta: HookMetadata;
} {
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
