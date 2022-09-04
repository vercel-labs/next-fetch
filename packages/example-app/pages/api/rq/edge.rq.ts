import z from "zod";
import { mutation, query } from "@next-fetch/react-query";
import { userAgent } from "next/server";

export const config = { runtime: "experimental-edge" };

export const useRuntimeInfo = query(
  z.object({ name: z.string() }),
  async ({ name }) => {
    return `${name}, EdgeRuntime = ${EdgeRuntime}`;
  },
  {
    hookResponse(text) {
      return new Response(text, {
        headers: { "x-direct-request": "true" },
      });
    },
  }
);

export const useRuntimeInfoMutation = mutation(
  z.object({ name: z.string() }),
  async function ({ name }) {
    return [
      `runtime: ${EdgeRuntime}`,
      `input: ${name}`,
      `request browser: ${userAgent(this.request).browser?.name}`,
    ];
  },
  {
    hookResponse(data) {
      return new Response(`response is: ${JSON.stringify(data)}`);
    },
  }
);

export const useNoArgs = query(async () => `${EdgeRuntime}`);
export const useNoArgsMutation = query(
  async function () {
    return this.request.method;
  },
  {
    hookResponse(data) {
      return new Response(`response is: ${JSON.stringify(data)}`);
    },
  }
);
