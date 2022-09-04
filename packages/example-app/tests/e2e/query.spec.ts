import { test, expect } from "@playwright/test";

test("basic test", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#singlePerson")).toHaveText("Hello, gal :D");
  await expect(page.locator("#allPeople")).toHaveText("Many people are here!");
});

test("direct request to node.js", async ({ page }) => {
  const response = await page.goto("/api/people?__handler=usePerson&name=Gal");
  const text = await response?.text();
  expect(text).toEqual("Hello, Gal :D");
  await expect(response?.headerValue("x-direct-request")).resolves.toEqual(
    "true"
  );
});

test("edge runtime", async ({ page }) => {
  await page.goto("/edge");
  await expect(page.locator("#runtimeInfo")).toHaveText(
    "gal, EdgeRuntime = edge-runtime"
  );
  await expect(page.locator("#noArgs")).toHaveText("edge-runtime");
});

test("react query", async ({ page }) => {
  await page.goto("/rq");
  await expect(page.locator("#singlePerson")).toHaveText("Hello, gal :D");
  await expect(page.locator("#allPeople")).toHaveText("Many people are here!");
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
