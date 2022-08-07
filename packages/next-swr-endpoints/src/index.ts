import type { SWRResponse } from "swr";
import type { SWRMutationResponse } from "swr/mutation";
import type { Parser } from "./parser";
import type { HandlerCallback } from "next-api-endpoints-core-plugin/server";
import { createPlugin } from "next-api-endpoints-core-plugin";

export function query<Input, Output>(
  parser: Parser<Input>,
  callback: HandlerCallback<Input, Output>
): (v: Input) => SWRResponse<Output> {
  throw new Error("This code path should not be reached");
}

export function mutation<Input, Output>(
  parser: Parser<Input>,
  callback: HandlerCallback<Input, Output>
): () => SWRMutationResponse<Output, any, Input> {
  throw new Error("This code path should not be reached");
}

export const withSwrApiEndpoints = /*#__PURE__*/ createPlugin({
  capturedExtensions: ["swr"],
  clientLoaderPath: "next-swr-endpoints/client-loader",
  serverLoaderPath: "next-swr-endpoints/server-loader",
  clientPackageName: "next-swr-endpoints/client",
  serverPackageName: "next-swr-endpoints/server",
});
