import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:55046"
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 55046",
    url: "http://127.0.0.1:55046",
    reuseExistingServer: true,
    timeout: 30_000
  }
});
