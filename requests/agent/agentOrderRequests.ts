import type { APIRequestContext } from '@playwright/test';

type ListAgentOrdersParams = {
  cursor?: string;
  limit?: number;
  seed?: number;
  status?: string;
};

export function listAgentOrders(request: APIRequestContext, params?: ListAgentOrdersParams) {
  return request.get('/agent/v1/orders', {
    params
  });
}
