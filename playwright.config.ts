import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: process.env.CI ? 'never' : 'always' }]],
  use: {
    baseURL: process.env.REQRES_BASE_URL ?? 'https://reqres.in',
    extraHTTPHeaders: {
      'User-Agent': 'playwright-api-automation-reqres/1.0'
    },
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'api'
    }
  ]
});
