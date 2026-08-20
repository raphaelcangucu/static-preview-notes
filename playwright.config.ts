import { defineConfig, devices } from '@playwright/test';

const publishedBaseUrl = process.env.AUDIT_BASE_URL;
const localBaseUrl = 'http://127.0.0.1:4173/static-preview-notes';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  outputDir: 'test-results/playwright',
  use: {
    baseURL: publishedBaseUrl || localBaseUrl,
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  webServer: publishedBaseUrl
    ? undefined
    : {
        command: 'node scripts/serve-dist.mjs',
        url: `${localBaseUrl}/`,
        reuseExistingServer: false,
        timeout: 30_000,
      },
});
