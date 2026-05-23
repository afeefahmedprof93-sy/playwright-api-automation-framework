import type { APIRequestContext } from '@playwright/test';
import { reqresApiHeaders } from '../../utils/env';

type ListLegacyUsersParams = {
  page?: number;
  per_page?: number;
};

type LegacyUserPayload = Record<string, string>;

export function listLegacyUsers(request: APIRequestContext, params?: ListLegacyUsersParams) {
  return request.get('/api/users', {
    headers: reqresApiHeaders(),
    params
  });
}

export function getLegacyUser(request: APIRequestContext, userId: number) {
  return request.get(`/api/users/${userId}`, {
    headers: reqresApiHeaders()
  });
}

export function createLegacyUser(request: APIRequestContext, data: LegacyUserPayload) {
  return request.post('/api/users', {
    headers: reqresApiHeaders(),
    data
  });
}

export function updateLegacyUser(request: APIRequestContext, userId: number, data: LegacyUserPayload) {
  return request.put(`/api/users/${userId}`, {
    headers: reqresApiHeaders(),
    data
  });
}

export function patchLegacyUser(request: APIRequestContext, userId: number, data: LegacyUserPayload) {
  return request.patch(`/api/users/${userId}`, {
    headers: reqresApiHeaders(),
    data
  });
}

export function deleteLegacyUser(request: APIRequestContext, userId: number) {
  return request.delete(`/api/users/${userId}`, {
    headers: reqresApiHeaders()
  });
}
