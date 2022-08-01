import { test, expect } from "@playwright/test";

test("mutation", async ({ page }) => {
  await page.goto("/form");
  const title = page.locator("#result");
  await expect(title).toHaveText("No data, idle.");

  const input = page.locator(`input[type="text"]`);
  await input.type("Gal");
  await input.press("Enter");

  await expect(title.locator("li:last-child")).toHaveText("Gal");
});

test("edge runtime", async ({ page }) => {
  await page.goto("/form-edge");
  const title = page.locator("#result");
  await expect(title).toHaveText("No data, idle.");

  const input = page.locator(`input[type="text"]`);
  await input.type("Gal");
  await input.press("Enter");

  await expect(title.locator("li").nth(0)).toHaveText("runtime: edge-runtime");
  await expect(title.locator("li").nth(1)).toHaveText("input: Gal");
});
