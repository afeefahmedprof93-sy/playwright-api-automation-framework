export const reqresApiKey = process.env.REQRES_API_KEY;
export const reqresEnv = process.env.REQRES_ENV ?? 'prod';

export function reqresApiHeaders(): Record<string, string> {
  if (!reqresApiKey) {
    throw new Error('REQRES_API_KEY is required for /api/* ReqRes tests.');
  }

  return {
    'x-api-key': reqresApiKey,
    'X-Reqres-Env': reqresEnv
  };
}

export function hasReqresApiKey(): boolean {
  return Boolean(reqresApiKey);
}
