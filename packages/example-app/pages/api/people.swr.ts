import z from "zod";
import { query, mutation } from "next-swr-endpoints";

export const useAllPeople = query(
  z.object({ name: z.string() }),
  async (user) => {
    return `Hello, ${user.name} :D`;
  }
);

export const useListPeopleWith = mutation(
  z.object({ name: z.string() }),
  async ({ name }) => {
    return ["John", "Jane", "Bob", "Alice", name.trim()];
  }
);
