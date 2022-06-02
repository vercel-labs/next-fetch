import z from "zod";
import { query } from "next-swr-endpoints";

export const useAllPeople = query(
  z.object({ name: z.string() }),
  async (user) => {
    return `Hello, ${user.name} :D`;
  }
);
