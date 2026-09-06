import { getApiBaseUrl } from "@/lib/api/config";
import {
  networkError,
  parseGetOnboardingError,
  parseSaveOnboardingError,
  type GetOnboardingError,
  type SaveOnboardingError,
} from "@/lib/api/errors";
import type { OnboardingProfile, OnboardingProfileInput } from "@/lib/api/types";

export type SaveOnboardingResult =
  | { ok: true; profile: OnboardingProfile }
  | { ok: false; error: SaveOnboardingError };

export type GetOnboardingResult =
  /** `profile: null` means "no onboarding profile saved yet" (backend 404) — a normal outcome
   * for a learner who hasn't been through onboarding, not an error. */
  | { ok: true; profile: OnboardingProfile | null }
  | { ok: false; error: GetOnboardingError };

/** PUTs to /learners/me/onboarding on your-universe-backend — upserts the signed-in learner's
 * onboarding answers (see lib/hooks/useOnboardingFlow.ts). Requires a valid learner access
 * token (see components/SessionContext.tsx). Never throws — every failure mode (missing/expired
 * token, validation, network, server error) comes back as a typed `error` on the result. */
export async function saveOnboardingProfile(
  accessToken: string,
  input: OnboardingProfileInput,
): Promise<SaveOnboardingResult> {
  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}/learners/me/onboarding`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(input),
    });
  } catch {
    return { ok: false, error: networkError() };
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // A non-JSON body (e.g. a plain-text 502 from a proxy) is handled by the status-based
    // fallback message in parseSaveOnboardingError.
  }

  if (!response.ok) return { ok: false, error: parseSaveOnboardingError(response.status, body) };
  return { ok: true, profile: body as OnboardingProfile };
}

/** GETs /learners/me/onboarding on your-universe-backend — the signed-in learner's own
 * onboarding answers, used to check whether they've already completed the flow (see
 * lib/hooks/useOnboardingStatus.ts) so the app doesn't send them through it again. Requires a
 * valid learner access token. Never throws; a 404 (no profile saved yet) comes back as
 * `ok: true, profile: null`, not an error. */
export async function getOnboardingProfile(accessToken: string): Promise<GetOnboardingResult> {
  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}/learners/me/onboarding`, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    return { ok: false, error: networkError() };
  }

  if (response.status === 404) return { ok: true, profile: null };

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // A non-JSON body (e.g. a plain-text 502 from a proxy) is handled by the status-based
    // fallback message in parseGetOnboardingError.
  }

  if (!response.ok) return { ok: false, error: parseGetOnboardingError(response.status, body) };
  return { ok: true, profile: body as OnboardingProfile };
}
