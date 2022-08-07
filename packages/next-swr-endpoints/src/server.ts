import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { type Parser, parse } from "./parser";

export type WithFormResolving<Output> = {
  resolveFormSubmission(
    this: RequestContext,
    data: Output
  ): Promise<Response> | Response;
};

export type RequestContext = {
  request: NextRequest;
};

export type HandlerCallback<Input, Output> = (
  this: RequestContext,
  input: Input
) => Promise<Output>;

type Handler<Input, Output> = {
  parser: Parser<Input>;
  callback: HandlerCallback<Input, Output>;
  options: Partial<WithFormResolving<Output>>;
};

type Handlers = Map<string, Handler<unknown, unknown>>;

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
  const forceJsonResponse =
    request.headers.get("accept") === "application/json+swr";
  url.searchParams.delete("__handler");

  if (!handler) {
    return new Response("unknown handler", { status: 400 });
  }

  const { parser, callback } = handler;
  let data: unknown;

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

  const response = await callback.call({ request }, data);

  if (handler.options?.resolveFormSubmission && !forceJsonResponse) {
    return handler.options.resolveFormSubmission.call({ request }, response);
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
  const forceJsonResponse = req.headers.accept === "application/json+swr";

  const handler = bag.get(String(req.query.__handler));
  delete req.query.__handler;

  if (!handler) {
    return res
      .status(400)
      .send(getUnknownHandlerError(String(req.query.__handler), bag));
  }

  const { parser, callback } = handler;
  let data;
  try {
    data = await parse(parser, bag === mutations ? req.body : req.query);
  } catch (e: any) {
    return res.status(400).send(e?.message || "Malformed input");
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

  if (handler.options?.resolveFormSubmission && !forceJsonResponse) {
    const manipulatedResponse =
      await handler.options.resolveFormSubmission.call(context, response);
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
