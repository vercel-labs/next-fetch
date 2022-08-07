import { test, expect } from "@playwright/test";

test("basic test", async ({ page }) => {
  await page.goto("/");
  const title = page.locator("#result");
  await expect(title).toHaveText("Hello, gal :D");
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
