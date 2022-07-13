import { type PlaywrightTestConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL || `http://localhost:9999`;

const config: PlaywrightTestConfig = {
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  testDir: "tests/e2e",
  ...(!process.env.BASE_URL && {
    webServer: {
      command: "pnpm run start --port=9999",
      url: "http://localhost:9999",
    },
  }),
  use: {
    trace: "on-first-retry",
    baseURL,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
};

export default config;
