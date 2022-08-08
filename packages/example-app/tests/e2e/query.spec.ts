import { test, expect } from "@playwright/test";

test("basic test", async ({ page }) => {
  await page.goto("/");
  const title = page.locator("#result");
  await expect(title).toHaveText("Hello, gal :D");
});

test("direct request to node.js", async ({ page }) => {
  const response = await page.goto(
    "/api/people?__handler=useAllPeople&name=Gal"
  );
  const text = await response?.text();
  expect(text).toEqual("Hello, Gal :D");
  await expect(response?.headerValue("x-direct-request")).resolves.toEqual(
    "true"
  );
});

test("edge runtime", async ({ page }) => {
  await page.goto("/edge");
  const title = page.locator("#result");
  await expect(title).toHaveText("gal, EdgeRuntime = edge-runtime");
});

test("react query", async ({ page }) => {
  await page.goto("/rq");
  const title = page.locator("#result");
  await expect(title).toHaveText("Hello, gal :D");
});

test("direct request to edge", async ({ page }) => {
  const response = await page.goto(
    "/api/edge?__handler=useRuntimeInfo&name=Gal"
  );
  const text = await response?.text();
  expect(text).toEqual("Gal, EdgeRuntime = edge-runtime");
  await expect(response?.headerValue("x-direct-request")).resolves.toEqual(
    "true"
  );
});
