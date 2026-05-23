import type { APIRequestContext } from '@playwright/test';
import { reqresApiHeaders } from '../../utils/env';

type AuthPayload = {
  email: string;
  password?: string;
};

export function registerLegacyUser(request: APIRequestContext, data: AuthPayload) {
  return request.post('/api/register', {
    headers: reqresApiHeaders(),
    data
  });
}

export function loginLegacyUser(request: APIRequestContext, data: AuthPayload) {
  return request.post('/api/login', {
    headers: reqresApiHeaders(),
    data
  });
}

export function logoutLegacyUser(request: APIRequestContext) {
  return request.post('/api/logout', {
    headers: reqresApiHeaders()
  });
}
