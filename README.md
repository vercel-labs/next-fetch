# Next Fetch

Think in React, instead about routing: Next Fetch is an intuitive way to dynamically fetch data from API endpoints in Next.js, using your favorite libraries.

💃 Import your API endpoints instead of making a stringified dance

🔒 Infer the types end-to-end for your data based on its implementation

⚛ Think in React, instead of routing: you only export a React hook!

🕵 Embrace best-practices: input validation, error handling, etc.

🌐 Use `Request` and `Response` classes as building blocks, no matter what runtime you're running on (Node.js or Edge)

📝 Use `<Form />` component for making progressive enhanced experiences

🤯 Supports [SWR](https://swr.vercel.app) and [React Query](https://tanstack.com/query/v4) out of the box!

## What does that mean?

Next Fetch is using compile-time transformations to allow you to _import_ your API endpoints instead of referencing them as plain strings, while keeping the type definitions co-located with the implementation.

<table>
<thead>
<tr>
<th></th>
<th>Next.js + Next Fetch</th>
<th>Plain Next.js</th>
</tr>
</thead>

<tbody>
<tr>
<td>API implementation</td>
<td>

```tsx
// pages/api/message.swr.tsx
import { query } from "@next-fetch/swr";
import z from "zod";

export const useMessage = query(
  // use zod for input validation
  z.object({
    name: z.string(),
  }),
  async function ({ name }) {
    // this.request is a `Request` instance
    return { hello: `world, ${name}` };
  }
);
```

</td>
<td>

```tsx
// pages/api/message.tsx
import type { NextApiRequest, NextApiResponse } from "next";

export default (req: NextApiRequest, res: NextApiResponse) => {
  // ad-hoc input validation
  const name = Array.isArray(req.query.name)
    ? req.query.name[0]
    : req.query.name;
  if (!name) {
    return res.status(400).json({ error: "No name provided" });
  }

  // explicit type defniitions required
  return res.status(200).json({ hello: `world, ${name}` });
};
```

</td>
</tr>
<tr>
<td>API consumption</td>
<td>

```tsx
import { useMessage } from "./api/message";

export default function MyPage() {
  const { data, error } = useMessage({
    // will autocomplete and
    // type-check the input arguments
    name: "John Doe",
  });

  // autocompletes and type-checks!
  const hello = data?.hello;

  return <div>{/* ... */}</div>;
}
```

</td>
<td>

```tsx
// pages/index.tsx
import useSWR from "swr";

const fetcher = (url: string) => {
  const response = await fetch(url);

  // handle input validation or runtime errors
  if (!response.ok) {
    const text = await response.text().catch(() => null);
    throw new Error(`response is not okay${text ? `: ${text}` : ""}`);
  }

  return await response.json();
};

export default function MyPage() {
  const { data, error } = useSWR("/api/message?name=John%20Doe", fetcher);
  /** `data` is `any`, so we need to explicitly type-cast here */
  return <div>{/* ... */}</div>;
}
```

</td>
</tr>
</tbody>

</table>
