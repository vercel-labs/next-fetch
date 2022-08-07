import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import type { Parser } from "next-api-endpoints-core-plugin/parser";
import type { HandlerCallback } from "next-api-endpoints-core-plugin/server";
import { createPlugin } from "next-api-endpoints-core-plugin";
import type { NextConfig } from "next";

export function query<Input, Output>(
  parser: Parser<Input>,
  callback: HandlerCallback<Input, Output>
): (v: Input) => UseQueryResult<Output> {
  throw new Error("This code path should not be reached");
}

export function mutation<Input, Output>(
  parser: Parser<Input>,
  callback: HandlerCallback<Input, Output>
): () => UseMutationResult<Output, any, Input> {
  throw new Error("This code path should not be reached");
}

export function withReactQueryApiEndpoints(given: NextConfig = {}): NextConfig {
  return createPlugin({
    capturedExtensions: ["rq"],
    clientLoaderPath: "next-rq-endpoints/client-loader",
    serverLoaderPath: "next-rq-endpoints/server-loader",
    clientPackageName: "next-rq-endpoints/client",
    serverPackageName: "next-rq-endpoints/server",
  })(given);
}
