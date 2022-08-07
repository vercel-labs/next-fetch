import {
  mutationFetcher,
  queryFetcher,
  buildUrlSearchParams,
} from "next-api-endpoints-core-plugin/client";
import {
  useQuery,
  UseQueryOptions,
  useMutation,
  MutationOptions,
} from "@tanstack/react-query";

export function createQueryHook(url: string, handlerName: string) {
  return (args: Record<string, unknown>, _opts?: UseQueryOptions) => {
    const searchParams = buildUrlSearchParams(handlerName, args);
    return useQuery(["query", url, String(searchParams)], () => {
      return queryFetcher(`${url}?${searchParams}`);
    });
  };
}

export function createMutationHook(url: string, handlerName: string) {
  return (opts?: MutationOptions<unknown, unknown>) => {
    const searchParams = buildUrlSearchParams(handlerName, {});
    return useMutation(
      (mutation) => {
        console.log({ mutation });
        return mutationFetcher(`${url}?${searchParams}`, { arg: mutation });
      },
      { ...opts }
    );
  };
}
