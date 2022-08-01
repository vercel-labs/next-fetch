// This file is just to make sure we don't break middleware

import { NextResponse } from "next/server";

export const middleware = () => {
  return NextResponse.next({
    headers: {
      "x-passed-middleware": "1",
    },
  });
};
