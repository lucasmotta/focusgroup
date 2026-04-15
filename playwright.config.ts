import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "**/*.spec.ts",
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "npx serve . -l 3000 --no-clipboard",
    port: 3000,
    reuseExistingServer: true,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
