import type { APIRequestContext } from '@playwright/test';

export function listAgentScenarios(request: APIRequestContext) {
  return request.get('/agent/v1/scenarios');
}

export function getAgentScenario(request: APIRequestContext, scenario: string) {
  return request.get(`/agent/v1/scenarios/${scenario}`);
}
