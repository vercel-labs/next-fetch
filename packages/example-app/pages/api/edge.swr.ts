import z from "zod";
import { mutation, query } from "next-swr-endpoints";

export const config = { runtime: "experimental-edge" };

export const useRuntimeInfo = query(
  z.object({ name: z.string() }),
  async ({ name }) => {
    return `${name}, EdgeRuntime = ${EdgeRuntime}`;
  }
);

export const useRuntimeInfoMutation = mutation(
  z.object({ name: z.string() }),
  async ({ name }) => {
    return [`runtime: ${EdgeRuntime}`, `input: ${name}`];
  }
);
