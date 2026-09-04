import { getApiBaseUrl } from "@/lib/api/config";
import {
  networkError,
  parseLoginError,
  parseRefreshError,
  type LoginError,
  type RefreshError,
} from "@/lib/api/errors";
import type { LearnerLoginInput, TokenPair } from "@/lib/api/types";

export type LoginLearnerResult = { ok: true; tokens: TokenPair } | { ok: false; error: LoginError };
export type RefreshTokenResult = { ok: true; tokens: TokenPair } | { ok: false; error: RefreshError };

async function parseJsonBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    // A non-JSON body (e.g. a plain-text 502 from a proxy) is handled by the status-based
    // fallback message in parseLoginError/parseRefreshError.
    return null;
  }
}

/** POSTs to /learners/login on your-universe-backend. Never throws — every failure mode
 * (invalid credentials, validation, network, server error) comes back as a typed `error` on
 * the result so the UI can render it directly. On success, the caller is responsible for
 * persisting the returned tokens (see components/SessionContext.tsx). */
export async function loginLearner(input: LearnerLoginInput): Promise<LoginLearnerResult> {
  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}/learners/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    return { ok: false, error: networkError() };
  }

  const body = await parseJsonBody(response);
  if (!response.ok) return { ok: false, error: parseLoginError(response.status, body) };
  return { ok: true, tokens: body as TokenPair };
}

/** POSTs to /auth/refresh on your-universe-backend, exchanging a learner refresh token for a
 * new token pair. Never throws — see loginLearner. */
export async function refreshLearnerToken(refreshToken: string): Promise<RefreshTokenResult> {
  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch {
    return { ok: false, error: networkError() };
  }

  const body = await parseJsonBody(response);
  if (!response.ok) return { ok: false, error: parseRefreshError(response.status, body) };
  return { ok: true, tokens: body as TokenPair };
}
