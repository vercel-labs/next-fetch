import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { type Parser, parse } from "./parser";

export type RequestContext = {
  request: NextRequest;
};

export type HandlerCallback<Input, Output> = (
  this: RequestContext,
  input: Input
) => Promise<Output>;

type NormalizedHandler<Input, Output> = {
  parser: Parser<Input>;
  callback: HandlerCallback<Input, Output>;
  options: Partial<HookIntoResponse<Output>>;
};

type Handler<Input, Output> =
  | NormalizedHandler<Input, Output>
  | {
      parser: HandlerCallback<Input, Output>;
      callback: Partial<HookIntoResponse<Output>>;
      options: undefined;
    };

type Handlers = Map<string, Handler<unknown, unknown>>;

const API_CONTENT_TYPE = "application/json+api";

function normalize<Input, Output>(
  handler: Handler<Input, Output>
): NormalizedHandler<Input, Output> {
  // @ts-expect-error This fails for some reason
  return typeof handler.parser === "function"
    ? {
        parser: undefined,
        callback: handler.parser,
        options: handler.callback,
      }
    : {
        parser: handler.parser,
        callback: handler.callback,
        options: handler.options,
      };
}

export async function handleEdgeFunction({
  queries,
  mutations,
  request,
}: {
  queries: Handlers;
  mutations: Handlers;
  request: NextRequest;
}) {
  const url = request.nextUrl.clone();
  const bag = request.method.toUpperCase() === "POST" ? mutations : queries;
  const handlerName = url.searchParams.get("__handler");
  if (!handlerName) {
    return new Response("Missing __handler", { status: 400 });
  }
  const handler = bag.get(handlerName);
  const forceJsonResponse = request.headers.get("accept") === API_CONTENT_TYPE;
  url.searchParams.delete("__handler");

  if (!handler) {
    return new Response("unknown handler", { status: 400 });
  }

  const { parser, callback, options } = normalize(handler);
  let data: unknown;

  if (parser) {
    try {
      data = await parse(
        parser,
        bag === mutations
          ? await getRequestBody(request)
          : fromSearchParamToObject(url.searchParams)
      );
    } catch (e: any) {
      return new Response(e?.message || "Malformed input", { status: 400 });
    }
  }

  const response = await callback.call({ request }, data);

  if (options?.hookResponse && !forceJsonResponse) {
    return options.hookResponse.call({ request }, response);
  }

  return NextResponse.json(response);
}

async function getRequestBody(request: Request): Promise<unknown> {
  if (
    request.headers.get("content-type") === "application/x-www-form-urlencoded"
  ) {
    return fromSearchParamToObject(new URLSearchParams(await request.text()));
  }

  return await request.json();
}

export async function handleNodejsFunction({
  req,
  res,
  queries,
  mutations,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
  queries: Handlers;
  mutations: Handlers;
}) {
  const bag = req.method?.toUpperCase() === "POST" ? mutations : queries;
  const forceJsonResponse = req.headers.accept === API_CONTENT_TYPE;

  const handler = bag.get(String(req.query.__handler));
  delete req.query.__handler;

  if (!handler) {
    return res
      .status(400)
      .send(getUnknownHandlerError(String(req.query.__handler), bag));
  }

  const { parser, callback, options } = normalize(handler);
  let data;
  if (parser) {
    try {
      data = await parse(parser, bag === mutations ? req.body : req.query);
    } catch (e: any) {
      return res.status(400).send(e?.message || "Malformed input");
    }
  }

  /**
   * A standard {@link Request} object that represents the current {@link NextApiRequest}
   */
  let request: NextRequest | null = null;
  const context: RequestContext = {
    get request() {
      if (!request) {
        request = createStandardRequestFromNodejsRequest(req);
      }
      return request;
    },
  };

  const response = await callback.call(context, data);

  if (options?.hookResponse && !forceJsonResponse) {
    const manipulatedResponse = await options.hookResponse.call(
      context,
      response
    );
    streamResponseResult(manipulatedResponse, res);
    return;
  }

  return res.send(JSON.stringify(response));
}

/**
 * Turns a {@link URLSearchParams} into a plain object that maps to Next.js ParsedQuery object.
 */
export function fromSearchParamToObject(
  searchParams: URLSearchParams
): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  for (const key of searchParams.keys()) {
    const value = searchParams.getAll(key);
    if (value.length === 1) {
      result[key] = value[0];
    } else {
      result[key] = value;
    }
  }
  return result;
}

function getUnknownHandlerError(handlerName: string, handlers: Handlers) {
  return `Unknown handler ${handlerName}. Available handlers: ${[
    ...handlers.keys(),
  ].join(", ")}`;
}

function createStandardRequestFromNodejsRequest(
  req: NextApiRequest
): NextRequest {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : `https://my-app`;
  const url = new URL(req.url ?? "/", baseUrl);
  return new NextRequest(url.toString(), {
    headers: Object.entries(req.headers).flatMap(([key, values]) => {
      if (Array.isArray(values)) {
        return values.map((value) => [key, value]);
      } else if (values === undefined) {
        return [];
      }
      return [[key, values]];
    }),
    method: req.method,
  });
}

function streamResponseResult(response: Response, res: NextApiResponse): void {
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  res.statusCode = response.status;

  if (!response.body) {
    res.end();
    return;
  }

  if ("pipe" in response.body) {
    // @ts-expect-error
    response.body.pipe(res);
  } else {
    res.end(response.body);
  }
}

export type HookIntoResponse<Output> = {
  /**
   * A hook to return a custom Response, when the request is handled
   * for a direct request (form submissions, user navigations, etc)
   *
   * @example
   * ```ts
   * hookResponse(output) {
   *   const newUrl = new URL(`/users/${output.id}`, this.request.url);
   *   return Response.redirect(newUrl.toString())
   * }
   * ```
   */
  hookResponse(
    this: RequestContext,
    output: Output
  ): Promise<Response> | Response;
};
