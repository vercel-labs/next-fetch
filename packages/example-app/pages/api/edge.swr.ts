import z from "zod";
import { mutation, query } from "next-swr-endpoints";
import { userAgent } from "next/server";

export const config = { runtime: "experimental-edge" };

export const useRuntimeInfo = query(
  z.object({ name: z.string() }),
  async ({ name }) => {
    return `${name}, EdgeRuntime = ${EdgeRuntime}`;
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
  }
);
