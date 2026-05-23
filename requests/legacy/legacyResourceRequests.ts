import type { APIRequestContext } from '@playwright/test';
import { reqresApiHeaders } from '../../utils/env';

type ListLegacyResourcesParams = {
  page?: number;
  per_page?: number;
};

export function listLegacyResources(request: APIRequestContext, params?: ListLegacyResourcesParams) {
  return request.get('/api/unknown', {
    headers: reqresApiHeaders(),
    params
  });
}

export function getLegacyResource(request: APIRequestContext, resourceId: number) {
  return request.get(`/api/unknown/${resourceId}`, {
    headers: reqresApiHeaders()
  });
}
