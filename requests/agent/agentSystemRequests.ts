import type { APIRequestContext } from '@playwright/test';

export function getAgentHealth(request: APIRequestContext) {
  return request.get('/agent/v1/health');
}
