import useSWR, { type SWRConfiguration } from "swr";
import useSWRMutation, { type SWRMutationConfiguration } from "swr/mutation";

/**
 * The fetcher implementation for `mutation` calls.
 */
export async function mutationFetcher(url: string, { arg }: { arg: unknown }) {
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(arg),
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error("Response with status ${response.status} is not ok.");
  }
  return response.json();
}

/**
 * The fetcher implementation for `mutation` calls.
 */
export async function queryFetcher(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Response with status ${response.status} is not ok.");
  }
  return response.json();
}

export function buildUrlSearchParams(
  handler: string,
  object: Record<string, unknown>
): URLSearchParams {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(object)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        sp.append(key, v);
      }
    } else {
      sp.append(key, String(value));
    }
  }
  sp.set("__handler", handler);
  return sp;
}

export function createQueryHook(url: string, handlerName: string) {
  return (args: Record<string, unknown>, opts?: SWRConfiguration) => {
    const searchParams = buildUrlSearchParams(handlerName, args);
    return useSWR(`${url}?${searchParams}`, {
      fetcher: queryFetcher,
      ...opts,
    });
  };
}

export function createMutationHook(url: string, handlerName: string) {
  return (opts?: SWRMutationConfiguration<unknown, unknown>) => {
    const searchParams = buildUrlSearchParams(handlerName, {});
    return useSWRMutation(`${url}?${searchParams}`, mutationFetcher, {
      ...opts,
    });
  };
}
