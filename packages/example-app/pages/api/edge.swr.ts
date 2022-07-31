import z from "zod";
import { query } from "next-swr-endpoints";

declare const EdgeRuntime: string;

export const config = { runtime: "experimental-edge" };

export const useAllPeople = query(
  z.object({ name: z.string() }),
  async ({ name }) => {
    return `${name}, EdgeRuntime = ${EdgeRuntime}`;
  }
);
