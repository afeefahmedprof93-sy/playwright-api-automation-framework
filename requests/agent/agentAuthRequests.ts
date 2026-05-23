import type { APIRequestContext } from '@playwright/test';

type LoginPayload = {
  email: string;
  password?: string;
};

export function loginAgentUser(request: APIRequestContext, data: LoginPayload) {
  return request.post('/agent/v1/auth/login', {
    data
  });
}
