import { test, expect } from "@playwright/test";

test("basic test", async ({ page }) => {
  await page.goto("http://localhost:3002");
  const title = page.locator("#result");
  await expect(title).toHaveText("Hello, gal :D");
});
