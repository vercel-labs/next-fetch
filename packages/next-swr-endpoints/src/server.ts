import type { NextApiRequest, NextApiResponse } from "next";
import { type NextRequest, NextResponse } from "next/server";
import type { Parser } from "./types";

type Handler<Input, Output> = {
  parser: Parser<Input>;
  callback: (t: Input) => Promise<Output>;
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
        ? await request.json()
        : fromSearchParamToObject(url.searchParams)
    );
  } catch (e: any) {
    return new Response(e?.message || "Malformed input", { status: 400 });
  }

  const response = await callback(data);
  return NextResponse.json(response);
}

function parse<T>(parser: Parser<T>, data: unknown): Promise<T> {
  return Promise.resolve(
    ("parse" in parser ? parser.parse : parser.parseAsync)(data)
  );
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

  const response = await callback(data);
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
