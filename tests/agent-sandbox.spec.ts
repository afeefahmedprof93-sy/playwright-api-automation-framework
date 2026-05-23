import { test } from '@playwright/test';
import { loginAgentUser } from '../requests/agent/agentAuthRequests';
import { listAgentOrders } from '../requests/agent/agentOrderRequests';
import { getAgentScenario, listAgentScenarios } from '../requests/agent/agentScenarioRequests';
import { getAgentHealth } from '../requests/agent/agentSystemRequests';
import { getAgentUser, listAgentUsers } from '../requests/agent/agentUserRequests';
import {
  expectNotToBe,
  expectToBe,
  expectToBeGreaterThan,
  expectToBeGreaterThanOrEqual,
  expectToBeInstanceOf,
  expectToBeTruthy,
  expectToContain,
  expectToEqual,
  expectToHaveLength,
  expectToMatch
} from '../utils/assertions';
import { skipIfRateLimited } from '../utils/responseGuards';
import { attachApiResponse } from '../utils/reporting';

test.describe('ReqRes Agent Sandbox API', () => {
  test('health endpoint returns service status and free-tier limits', async ({ request }, testInfo) => {
    const response = await getAgentHealth(request);
    const { body } = await attachApiResponse<any>(testInfo, 'Health check', response);
    skipIfRateLimited(response);

    expectToBe('response status', response.status(), 200);
    expectToBe('health status', body.data.status, 'healthy');
    expectToMatch('health version', body.data.version, /^v\d+\.\d+\.\d+$/);
    expectToBeTruthy('rate limit tier', body.data.rate_limit_status.tier);
    expectToBeGreaterThanOrEqual('remaining daily requests', body.data.rate_limit_status.remaining_today, 0);
  });

  test('users endpoint returns deterministic cursor-paginated data', async ({ request }, testInfo) => {
    const firstPage = await listAgentUsers(request, {
      seed: 42,
      limit: 2
    });
    const firstPageReport = await attachApiResponse<any>(testInfo, 'Users first page', firstPage);
    skipIfRateLimited(firstPage);

    expectToBe('first page response status', firstPage.status(), 200);

    const firstPageBody = firstPageReport.body;
    expectToHaveLength('first page users', firstPageBody.data, 2);
    expectToBe('first page limit', firstPageBody.meta.limit, 2);
    expectToBe('first page returned count', firstPageBody.meta.returned, 2);
    expectToBeTruthy('first page next cursor', firstPageBody.meta.next_cursor);

    const firstUser = firstPageBody.data[0];
    expectToMatch('first user id', firstUser.id, /^usr_[A-Z0-9]{26}$/);
    expectToContain('first user email', firstUser.email, '@');
    expectToBe(
      'first user company null or company name string',
      firstUser.profile.company === null || typeof firstUser.profile.company.name === 'string',
      true
    );

    const secondPage = await listAgentUsers(request, {
      cursor: firstPageBody.meta.next_cursor
    });
    const secondPageReport = await attachApiResponse<any>(testInfo, 'Users second page', secondPage);
    skipIfRateLimited(secondPage);

    expectToBe('second page response status', secondPage.status(), 200);

    const secondPageBody = secondPageReport.body;
    expectToBeGreaterThan('second page user count', secondPageBody.data.length, 0);
    expectNotToBe('second page first user id', secondPageBody.data[0].id, firstUser.id);
  });

  test('single user endpoint returns expanded related resources', async ({ request }, testInfo) => {
    const usersResponse = await listAgentUsers(request, {
      seed: 42,
      limit: 1
    });
    const usersReport = await attachApiResponse<any>(testInfo, 'User lookup seed page', usersResponse);
    skipIfRateLimited(usersResponse);
    const usersBody = usersReport.body;
    const userId = usersBody.data[0].id;

    const response = await getAgentUser(request, userId, {
      expand: 'addresses,activity,organizations'
    });
    const { body } = await attachApiResponse<any>(testInfo, 'Expanded user details', response);
    skipIfRateLimited(response);

    expectToBe('response status', response.status(), 200);
    expectToBe('expanded user id', body.data.id, userId);
    expectToBeInstanceOf('expanded user addresses', body.data.addresses, Array);
    expectToBeInstanceOf('expanded user activity', body.data.activity, Array);
    expectToBeInstanceOf('expanded user organizations', body.data.organizations, Array);
  });

  test('users endpoint supports sparse fieldsets and clamps large limits', async ({ request }, testInfo) => {
    const response = await listAgentUsers(request, {
      seed: 42,
      limit: 150,
      fields: 'id,email'
    });
    const { body } = await attachApiResponse<any>(testInfo, 'Sparse users fieldset', response);
    skipIfRateLimited(response);

    expectToBe('response status', response.status(), 200);
    expectToBe('clamped users limit', body.meta.limit, 100);
    expectToBe('clamped users returned count', body.meta.returned, 100);
    expectToEqual('sparse user keys', Object.keys(body.data[0]).sort(), ['email', 'id']);
  });

  test('orders endpoint returns relational order data and integer money values', async ({ request }, testInfo) => {
    const response = await listAgentOrders(request, {
      seed: 42,
      limit: 2
    });
    const { body } = await attachApiResponse<any>(testInfo, 'Orders list', response);
    skipIfRateLimited(response);

    expectToBe('response status', response.status(), 200);
    expectToHaveLength('orders list', body.data, 2);
    expectToBe('orders returned count', body.meta.returned, 2);

    const order = body.data[0];
    expectToMatch('order id', order.id, /^ord_[A-Z0-9]{26}$/);
    expectToMatch('order customer id', order.customer.id, /^usr_[A-Z0-9]{26}$/);
    expectToBeGreaterThan('order line item count', order.line_items.length, 0);
    expectToBe('order total amount is integer', Number.isInteger(order.totals.total.amount), true);
    expectToBe('order total currency', order.totals.total.currency, 'USD');
    expectToMatch('order formatted total', order.totals.total.formatted, /^\$/);
  });

  test('orders endpoint filters results by status', async ({ request }, testInfo) => {
    const response = await listAgentOrders(request, {
      seed: 42,
      status: 'refunded',
      limit: 3
    });
    const { body } = await attachApiResponse<any>(testInfo, 'Filtered refunded orders', response);
    skipIfRateLimited(response);

    expectToBe('response status', response.status(), 200);
    expectToHaveLength('filtered refunded orders', body.data, 3);
    expectToBe('all returned order statuses are refunded', body.data.every((order: { status: string }) => order.status === 'refunded'), true);
  });

  test('orders endpoint rejects invalid status filters', async ({ request }, testInfo) => {
    const response = await listAgentOrders(request, {
      status: 'not-real'
    });
    const { body } = await attachApiResponse<any>(testInfo, 'Invalid order status', response);
    skipIfRateLimited(response);

    expectToBe('response status', response.status(), 400);
    expectToBe('invalid status error code', body.error, 'invalid_status');
    expectToContain('invalid status hint', body.hint, 'pending');
  });

  test('login endpoint returns a bearer session for valid sandbox credentials', async ({ request }, testInfo) => {
    const response = await loginAgentUser(request, {
      email: 'marcus.khan@example.com',
      password: 'password'
    });
    const { body } = await attachApiResponse<any>(testInfo, 'Sandbox login success', response);
    skipIfRateLimited(response);

    expectToBe('response status', response.status(), 200);
    expectToBe('session token type', body.data.session.token_type, 'Bearer');
    expectToMatch('session token', body.data.session.token, /^agt_sess_/);
    expectToBeGreaterThan('session expiry seconds', body.data.session.expires_in, 0);
    expectToBe('logged in user email', body.data.user.email, 'marcus.khan@example.com');
  });

  test('login endpoint returns MFA challenge for MFA-enabled accounts', async ({ request }, testInfo) => {
    const response = await loginAgentUser(request, {
      email: 'marcus.khan+mfa@example.com',
      password: 'password'
    });
    const { body } = await attachApiResponse<any>(testInfo, 'Sandbox MFA login challenge', response);
    skipIfRateLimited(response);

    expectToBe('response status', response.status(), 200);
    expectToMatch('MFA challenge token', body.data.challenge.challenge_token, /^agt_mfa_/);
    expectToContain('MFA methods available', body.data.challenge.methods_available, 'totp');
    expectToBe('MFA next step URL', body.next_step.url, '/agent/v1/auth/mfa/verify');
  });

  test('login endpoint rejects invalid credentials', async ({ request }, testInfo) => {
    const response = await loginAgentUser(request, {
      email: 'marcus.khan+wrong@example.com',
      password: 'password'
    });
    const { body } = await attachApiResponse<any>(testInfo, 'Sandbox invalid credentials', response);
    skipIfRateLimited(response);

    expectToBe('response status', response.status(), 401);
    expectToBe('invalid credentials error code', body.error, 'invalid_credentials');
    expectToBeGreaterThan('login attempts remaining', body.attempts_remaining, 0);
  });

  test('login endpoint validates required fields', async ({ request }, testInfo) => {
    const response = await loginAgentUser(request, {
      email: 'marcus.khan@example.com'
    });
    const { body } = await attachApiResponse<any>(testInfo, 'Sandbox missing password', response);
    skipIfRateLimited(response);

    expectToBe('response status', response.status(), 400);
    expectToBe('missing fields error code', body.error, 'missing_fields');
    expectToBe('password field validation', body.fields.password, 'required');
  });

  test('single user endpoint rejects invalid id format', async ({ request }, testInfo) => {
    const response = await getAgentUser(request, 'not-a-user');
    const { body } = await attachApiResponse<any>(testInfo, 'Invalid sandbox user id', response);
    skipIfRateLimited(response);

    expectToBe('response status', response.status(), 400);
    expectToBe('invalid user id error code', body.error, 'invalid_id_format');
    expectToContain('invalid user id message', body.message, 'usr_');
  });

  test('scenarios endpoint returns the failure scenario catalogue', async ({ request }, testInfo) => {
    const response = await listAgentScenarios(request);
    const { body } = await attachApiResponse<any>(testInfo, 'Scenario catalogue', response);
    skipIfRateLimited(response);

    expectToBe('response status', response.status(), 200);

    const scenarioNames = body.data.map((scenario: { name: string }) => scenario.name);
    expectToContain('scenario names', scenarioNames, 'rate-limited');
    expectToContain('scenario names', scenarioNames, 'validation-error');
    expectToContain('scenario names', scenarioNames, 'malformed-json');
  });

  test('known validation scenario returns intentional client error', async ({ request }, testInfo) => {
    const response = await getAgentScenario(request, 'validation-error');
    const { body } = await attachApiResponse<any>(testInfo, 'Validation error scenario', response);
    skipIfRateLimited(response);

    expectToBe('response status', response.status(), 422);
    expectToBeTruthy('intentional scenario header', response.headers()['x-agent-sandbox-intentional']);
    expectToBeTruthy('validation scenario error', body.error);
  });

  test('malformed-json scenario returns intentionally invalid JSON', async ({ request }, testInfo) => {
    const response = await getAgentScenario(request, 'malformed-json');
    const { bodyText } = await attachApiResponse(testInfo, 'Malformed JSON scenario', response);
    skipIfRateLimited(response);

    expectToBe('response status', response.status(), 200);
    expectToBe('intentional scenario header', response.headers()['x-agent-sandbox-intentional'], 'malformed-json');
    expectToBe('malformed JSON raw body', bodyText, '{"data":');
  });
});
