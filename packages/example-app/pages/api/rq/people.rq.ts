import z from "zod";
import { query, mutation } from "next-rq-endpoints";
import { userAgent } from "next/server";

export const useAllPeople = query(
  z.object({ name: z.string() }),
  async (user) => {
    return `Hello, ${user.name} :D`;
  }
);

export const useListPeopleWith = mutation(
  z.object({ name: z.string() }),
  async function ({ name }) {
    const agent = userAgent(this.request);
    return [
      agent.browser.name ?? "Unknown",
      "John",
      "Jane",
      "Bob",
      "Alice",
      name.trim(),
    ];
  }
);
