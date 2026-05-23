import { expect, test } from '@playwright/test';
import { loginLegacyUser, logoutLegacyUser, registerLegacyUser } from '../requests/legacy/legacyAuthRequests';
import { getLegacyResource, listLegacyResources } from '../requests/legacy/legacyResourceRequests';
import {
  createLegacyUser,
  deleteLegacyUser,
  getLegacyUser,
  listLegacyUsers,
  patchLegacyUser,
  updateLegacyUser
} from '../requests/legacy/legacyUserRequests';
import {
  expectToBe,
  expectToBeTruthy,
  expectToContain,
  expectToEqual,
  expectToHaveLength,
  expectToMatch
} from '../utils/assertions';
import { hasReqresApiKey } from '../utils/env';
import { attachApiResponse } from '../utils/reporting';

test.describe('ReqRes legacy /api/users endpoints', () => {
  test.skip(!hasReqresApiKey(), 'Set REQRES_API_KEY in .env to run ReqRes /api/* tests.');

  test('lists users with pagination metadata', async ({ request }, testInfo) => {
    const response = await listLegacyUsers(request, {
      page: 2,
      per_page: 3
    });
    const { body } = await attachApiResponse<any>(testInfo, 'Legacy users page', response);

    expectToBe('response status', response.status(), 200);
    expectToBe('users page number', body.page, 2);
    expectToBe('users per page', body.per_page, 3);
    expectToHaveLength('users page data', body.data, 3);
    expectToEqual(
      'first user object',
      body.data[0],
      expect.objectContaining({
        id: expect.any(Number),
        email: expect.stringContaining('@'),
        first_name: expect.any(String),
        last_name: expect.any(String)
      })
    );
  });

  test('gets a single user by id', async ({ request }, testInfo) => {
    const response = await getLegacyUser(request, 2);
    const { body } = await attachApiResponse<any>(testInfo, 'Legacy user details', response);

    expectToBe('response status', response.status(), 200);
    expectToBe('legacy user id', body.data.id, 2);
    expectToContain('legacy user email', body.data.email, '@');
  });

  test('returns not found for an unknown user id', async ({ request }, testInfo) => {
    const response = await getLegacyUser(request, 23);
    await attachApiResponse(testInfo, 'Legacy user not found', response);

    expectToBe('response status', response.status(), 404);
  });

  test('creates a demo user', async ({ request }, testInfo) => {
    const payload = {
      name: 'morpheus',
      job: 'leader'
    };

    const response = await createLegacyUser(request, payload);
    const { body } = await attachApiResponse<any>(testInfo, 'Create legacy user', response);

    expectToBe('response status', response.status(), 201);
    expectToEqual(
      'created user response body',
      body,
      expect.objectContaining({
        ...payload,
        id: expect.any(String),
        createdAt: expect.any(String)
      })
    );
  });

  test('updates a demo user', async ({ request }, testInfo) => {
    const payload = {
      name: 'morpheus',
      job: 'zion resident'
    };

    const response = await updateLegacyUser(request, 2, payload);
    const { body } = await attachApiResponse<any>(testInfo, 'Update legacy user', response);

    expectToBe('response status', response.status(), 200);
    expectToEqual(
      'updated user response body',
      body,
      expect.objectContaining({
        ...payload,
        updatedAt: expect.any(String)
      })
    );
  });

  test('partially updates a demo user', async ({ request }, testInfo) => {
    const payload = {
      job: 'captain'
    };

    const response = await patchLegacyUser(request, 2, payload);
    const { body } = await attachApiResponse<any>(testInfo, 'Patch legacy user', response);

    expectToBe('response status', response.status(), 200);
    expectToEqual(
      'patched user response body',
      body,
      expect.objectContaining({
        ...payload,
        updatedAt: expect.any(String)
      })
    );
  });

  test('deletes a demo user', async ({ request }, testInfo) => {
    const response = await deleteLegacyUser(request, 2);
    const { bodyText } = await attachApiResponse(testInfo, 'Delete legacy user', response);

    expectToBe('response status', response.status(), 204);
    expectToBe('delete response body', bodyText, '');
  });
});

test.describe('ReqRes legacy /api/unknown resource endpoints', () => {
  test.skip(!hasReqresApiKey(), 'Set REQRES_API_KEY in .env to run ReqRes /api/* tests.');

  test('lists unknown resources with pagination metadata', async ({ request }, testInfo) => {
    const response = await listLegacyResources(request, {
      page: 1,
      per_page: 3
    });
    const { body } = await attachApiResponse<any>(testInfo, 'Legacy unknown resources page', response);

    expectToBe('response status', response.status(), 200);
    expectToBe('unknown resources page number', body.page, 1);
    expectToBe('unknown resources per page', body.per_page, 3);
    expectToHaveLength('unknown resources page data', body.data, 3);
    expectToEqual(
      'first unknown resource object',
      body.data[0],
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        year: expect.any(Number),
        color: expect.stringMatching(/^#/),
        pantone_value: expect.any(String)
      })
    );
  });

  test('gets an unknown resource by id', async ({ request }, testInfo) => {
    const response = await getLegacyResource(request, 2);
    const { body } = await attachApiResponse<any>(testInfo, 'Legacy unknown resource details', response);

    expectToBe('response status', response.status(), 200);
    expectToBe('unknown resource id', body.data.id, 2);
    expectToMatch('unknown resource color', body.data.color, /^#/);
  });

  test('returns not found for an unknown resource id', async ({ request }, testInfo) => {
    const response = await getLegacyResource(request, 23);
    await attachApiResponse(testInfo, 'Legacy unknown resource not found', response);

    expectToBe('response status', response.status(), 404);
  });
});

test.describe('ReqRes legacy authentication endpoints', () => {
  test.skip(!hasReqresApiKey(), 'Set REQRES_API_KEY in .env to run ReqRes /api/* tests.');

  test('registers a demo user with valid credentials', async ({ request }, testInfo) => {
    const response = await registerLegacyUser(request, {
      email: 'eve.holt@reqres.in',
      password: 'pistol'
    });
    const { body } = await attachApiResponse<any>(testInfo, 'Legacy register success', response);

    expectToBe('response status', response.status(), 200);
    expectToBeTruthy('registered user id', body.id);
    expectToBeTruthy('registration token', body.token);
  });

  test('rejects registration when password is missing', async ({ request }, testInfo) => {
    const response = await registerLegacyUser(request, {
      email: 'sydney@fife'
    });
    const { body } = await attachApiResponse<any>(testInfo, 'Legacy register missing password', response);

    expectToBe('response status', response.status(), 400);
    expectToBeTruthy('registration error', body.error);
  });

  test('logs in a demo user with valid credentials', async ({ request }, testInfo) => {
    const response = await loginLegacyUser(request, {
      email: 'eve.holt@reqres.in',
      password: 'cityslicka'
    });
    const { body } = await attachApiResponse<any>(testInfo, 'Legacy login success', response);

    expectToBe('response status', response.status(), 200);
    expectToBeTruthy('login token', body.token);
  });

  test('rejects login when password is missing', async ({ request }, testInfo) => {
    const response = await loginLegacyUser(request, {
      email: 'peter@klaven'
    });
    const { body } = await attachApiResponse<any>(testInfo, 'Legacy login missing password', response);

    expectToBe('response status', response.status(), 400);
    expectToBeTruthy('login error', body.error);
  });

  test('logs out a demo user', async ({ request }, testInfo) => {
    const response = await logoutLegacyUser(request);
    const { body } = await attachApiResponse<any>(testInfo, 'Legacy logout', response);

    expectToBe('response status', response.status(), 200);
    expectToEqual('logout response body', body, expect.any(Object));
  });
});
