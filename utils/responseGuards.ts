import { test, type APIResponse } from '@playwright/test';

export function skipIfRateLimited(response: APIResponse) {
  test.skip(response.status() === 429, 'ReqRes public rate limit is exhausted for this environment.');
}
