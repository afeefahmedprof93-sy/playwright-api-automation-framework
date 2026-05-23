import type { APIRequestContext } from '@playwright/test';

type ListAgentUsersParams = {
  cursor?: string;
  fields?: string;
  limit?: number;
  seed?: number;
};

type GetAgentUserParams = {
  expand?: string;
};

export function listAgentUsers(request: APIRequestContext, params?: ListAgentUsersParams) {
  return request.get('/agent/v1/users', {
    params
  });
}

export function getAgentUser(request: APIRequestContext, userId: string, params?: GetAgentUserParams) {
  return request.get(`/agent/v1/users/${userId}`, {
    params
  });
}
