import {
  addMetadata,
  buildUrlSearchParams,
  mutationFetcher,
  queryFetcher,
  type HookMetadata,
} from "@next-fetch/core-plugin/client";
import useSWR, { type SWRConfiguration } from "swr";
import useSWRMutation, { type SWRMutationConfiguration } from "swr/mutation";

export function createQueryHook(baseUrl: string, handlerName: string) {
  return addMetadata(
    { baseUrl, handlerName, method: "get" },
    (args: Record<string, unknown>, opts?: SWRConfiguration) => {
      const searchParams = buildUrlSearchParams(handlerName, args);
      return useSWR(`${baseUrl}?${searchParams}`, {
        fetcher: queryFetcher,
        ...opts,
      });
    }
  );
}

export function createMutationHook(baseUrl: string, handlerName: string) {
  const meta: HookMetadata = { baseUrl, handlerName, method: "post" };
  return addMetadata(
    meta,
    (opts?: SWRMutationConfiguration<unknown, unknown>) => {
      const searchParams = buildUrlSearchParams(handlerName, {});
      return addMetadata(
        meta,
        useSWRMutation(`${baseUrl}?${searchParams}`, mutationFetcher, {
          ...opts,
        })
      );
    }
  );
}
