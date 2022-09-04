import z from "zod";
import { query, mutation } from "@next-fetch/react-query";
import { userAgent } from "next/server";

export const useAllPeople = query(
  async () => {
    return `Many people are here!`;
  },
  {
    hookResponse(text) {
      return new Response(text, {
        headers: { "x-direct-request": "true" },
      });
    },
  }
);

export const usePerson = query(
  z.object({ name: z.string() }),
  async (user) => {
    return `Hello, ${user.name} :D`;
  },
  {
    hookResponse(text) {
      return new Response(text, {
        headers: { "x-direct-request": "true" },
      });
    },
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
  },
  {
    hookResponse(data) {
      return new Response(`response is: ${JSON.stringify(data)}`);
    },
  }
);
