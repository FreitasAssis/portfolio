import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;
const BASE_URL = `http://127.0.0.1:${PORT}`;

/**
 * E2E roda contra o artefato de produção, não contra `next dev`. O site é um
 * export estático e é o `out/` que vai ao ar; testar o dev server testaria
 * um build que ninguém publica.
 *
 * O Vitest ignora `tests/e2e/**` (ver `vitest.config.ts`), então `npm run test`
 * e `npm run test:e2e` não se atropelam.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build && node tests/e2e/static-server.mjs`,
    url: BASE_URL,
    env: { PORT: String(PORT) },
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
