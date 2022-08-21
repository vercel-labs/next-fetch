import {
  mutationFetcher,
  queryFetcher,
  buildUrlSearchParams,
  addMetadata,
} from "@next-fetch/core-plugin/client";
import {
  useQuery,
  type UseQueryOptions,
  useMutation,
  type MutationOptions,
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
    return addMetadata(
      {
        handlerName,
        baseUrl: url,
        method: "POST",
      },
      useMutation(
        (mutation) => {
          console.log({ mutation });
          return mutationFetcher(`${url}?${searchParams}`, { arg: mutation });
        },
        { ...opts }
      )
    );
  };
}
