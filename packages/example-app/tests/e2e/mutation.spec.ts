import { test, expect } from "@playwright/test";

test("mutation", async ({ page }) => {
  await page.goto("/form");
  const result = page.locator("#result");
  await expect(result).toHaveText("No data, idle.");

  const input = page.locator(`input[type="text"]`);
  await input.type("Gal");
  await input.press("Enter");

  const list = result.locator("li");
  await expect(list.first()).toHaveText("Chrome");
  await expect(list.last()).toHaveText("Gal");
});

test("react query mutation", async ({ page }) => {
  await page.goto("/rq/form");
  const result = page.locator("#result");
  await expect(result).toHaveText("No data, idle.");

  const input = page.locator(`input[type="text"]`);
  await input.type("Gal");
  await input.press("Enter");

  const list = result.locator("li");
  await expect(list.first()).toHaveText("Chrome");
  await expect(list.last()).toHaveText("Gal");
});

test("edge runtime", async ({ page }) => {
  await page.goto("/form-edge");
  const result = page.locator("#result");
  await expect(result).toHaveText("No data, idle.");

  const input = page.locator(`input[type="text"]`);
  await input.type("Gal");
  await input.press("Enter");

  const list = result.locator("li");
  await expect(list.nth(0)).toHaveText("runtime: edge-runtime");
  await expect(list.nth(1)).toHaveText("input: Gal");
  await expect(list.nth(2)).toHaveText("request browser: Chrome");
});

test.describe("without javascript enabled", () => {
  test.use({
    javaScriptEnabled: false,
  });

  test.describe("swr", () => {
    test("nodejs runtime", async ({ page }) => {
      await page.goto(`/form`);
      const result = page.locator("#result");
      await expect(result).toHaveText("No data, idle.");

      const input = page.locator(`input[type="text"]`);
      await input.type("Gal");
      await input.press("Enter");

      await expect(page.locator("body")).toHaveText(
        "response is: " +
          JSON.stringify(["Chrome", "John", "Jane", "Bob", "Alice", "Gal"])
      );
    });

    test("edge runtime", async ({ page }) => {
      await page.goto(`/form-edge`);
      const result = page.locator("#result");
      await expect(result).toHaveText("No data, idle.");

      const input = page.locator(`input[type="text"]`);
      await input.type("Gal");
      await input.press("Enter");

      await expect(page.locator("body")).toHaveText(
        "response is: " +
          JSON.stringify([
            "runtime: edge-runtime",
            "input: Gal",
            "request browser: Chrome",
          ])
      );
    });
  });

  test.describe("react-query", () => {
    test("nodejs runtime", async ({ page }) => {
      await page.goto(`/rq/form`);
      const result = page.locator("#result");
      await expect(result).toHaveText("No data, idle.");

      const input = page.locator(`input[type="text"]`);
      await input.type("Gal");
      await input.press("Enter");

      await expect(page.locator("body")).toHaveText(
        "response is: " +
          JSON.stringify(["Chrome", "John", "Jane", "Bob", "Alice", "Gal"])
      );
    });

    test("edge runtime", async ({ page }) => {
      await page.goto(`/rq/form-edge`);
      const result = page.locator("#result");
      await expect(result).toHaveText("No data, idle.");

      const input = page.locator(`input[type="text"]`);
      await input.type("Gal");
      await input.press("Enter");

      await expect(page.locator("body")).toHaveText(
        "response is: " +
          JSON.stringify([
            "runtime: edge-runtime",
            "input: Gal",
            "request browser: Chrome",
          ])
      );
    });
  });
});
