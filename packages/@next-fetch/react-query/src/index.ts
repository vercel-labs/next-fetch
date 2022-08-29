import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import type { Parser } from "@next-fetch/core-plugin/parser";
import type { HandlerCallback } from "@next-fetch/core-plugin/server";
import type { NextConfig } from "next";
import type { HookMetadata } from "@next-fetch/core-plugin/client";
import { createPlugin } from "@next-fetch/core-plugin";

export function query<Input, Output>(
  parser: Parser<Input>,
  callback: HandlerCallback<Input, Output>
): (v: Input) => UseQueryResult<Output> {
  throw new Error("This code path should not be reached");
}

export function mutation<Input, Output>(
  parser: Parser<Input>,
  callback: HandlerCallback<Input, Output>
): () => UseMutationResult<Output, any, Input> & { meta: HookMetadata } {
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
