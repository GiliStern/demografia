import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src-phaser/e2e",
  timeout: 45_000,
  expect: {
    timeout: 8_000,
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://127.0.0.1:4177",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev:phaser -- --host 127.0.0.1 --port 4177",
    url: "http://127.0.0.1:4177/index-phaser.html",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
