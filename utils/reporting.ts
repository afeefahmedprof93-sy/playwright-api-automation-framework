import { test, type APIResponse, type TestInfo } from '@playwright/test';

type ReportedResponse<TBody = unknown> = {
  body: TBody;
  bodyText: string;
  headers: Record<string, string>;
  status: number;
};

export async function attachApiResponse<TBody = unknown>(
  testInfo: TestInfo,
  label: string,
  response: APIResponse
): Promise<ReportedResponse<TBody>> {
  const bodyText = await response.text();
  const headers = response.headers();
  const status = response.status();
  const body = parseBody(bodyText) as TBody;

  await test.step(`${label} response values`, async () => {
    await testInfo.attach(`${label} - API response`, {
      body: JSON.stringify(
        {
          status,
          headers,
          body
        },
        null,
        2
      ),
      contentType: 'application/json'
    });
  });

  return {
    body,
    bodyText,
    headers,
    status
  };
}

function parseBody(bodyText: string): unknown {
  if (!bodyText) {
    return null;
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    return bodyText;
  }
}
