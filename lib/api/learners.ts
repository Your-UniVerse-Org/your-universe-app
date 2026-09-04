import { getApiBaseUrl } from "@/lib/api/config";
import { networkError, parseRegisterLearnerError, type RegisterLearnerError } from "@/lib/api/errors";
import type { Learner, LearnerRegistrationInput } from "@/lib/api/types";

export type RegisterLearnerResult = { ok: true; learner: Learner } | { ok: false; error: RegisterLearnerError };

/** POSTs to /learners on your-universe-backend to register a new learner. Never throws —
 * every failure mode (validation, duplicate email, network, server error) comes back as a
 * typed `error` on the result so the UI can render it directly. */
export async function registerLearner(input: LearnerRegistrationInput): Promise<RegisterLearnerResult> {
  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}/learners`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
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
    // fallback message below.
  }

  if (!response.ok) {
    return { ok: false, error: parseRegisterLearnerError(response.status, body) };
  }

  return { ok: true, learner: body as Learner };
}
