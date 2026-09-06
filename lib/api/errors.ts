import type { LearnerField } from "@/lib/api/types";

export type LearnerFieldErrors = Partial<Record<LearnerField, string>>;

/** Shared across every API error union in this file — a `fetch` that threw (offline, DNS
 * failure, etc.) rather than returning a response. */
export type NetworkError = { kind: "network"; message: string };

export type RegisterLearnerError =
  | { kind: "validation"; fieldErrors: LearnerFieldErrors; formError?: string }
  | { kind: "conflict"; message: string }
  | NetworkError
  | { kind: "server"; message: string };

const KNOWN_FIELDS: readonly LearnerField[] = [
  "full_name",
  "email",
  "school",
  "gender",
  "guardian_email",
  "date_of_birth",
  "phone_number",
  "password",
];

function isLearnerField(value: unknown): value is LearnerField {
  return typeof value === "string" && (KNOWN_FIELDS as readonly string[]).includes(value);
}

/** One entry from a FastAPI/Pydantic 422 `detail` array. */
type FastApiValidationIssue = {
  type?: unknown;
  loc?: unknown;
  msg?: unknown;
};

function stripValueErrorPrefix(msg: string): string {
  return msg.replace(/^Value error,\s*/i, "");
}

/** Walks a FastAPI/Pydantic 422 `detail` array into per-field messages (keyed by whatever
 * `isField` accepts) plus a joined form-level message for anything else — a cross-field rule
 * (loc has no field segment) or a plain string `detail`. Shared by every endpoint that returns
 * this same 422 shape (registration, login). */
function parseLocFieldValidation<F extends string>(
  body: unknown,
  isField: (value: unknown) => value is F,
): { fieldErrors: Partial<Record<F, string>>; formError?: string } {
  const fieldErrors: Partial<Record<F, string>> = {};
  const formErrors: string[] = [];

  const issues = body && typeof body === "object" && "detail" in body ? (body as { detail: unknown }).detail : null;

  if (Array.isArray(issues)) {
    for (const raw of issues as FastApiValidationIssue[]) {
      const msg = typeof raw.msg === "string" ? stripValueErrorPrefix(raw.msg) : "Invalid value.";
      // loc is ["body", "<field>", ...] for a field-specific error, or just ["body"] for a
      // cross-field (model-level) error such as "email and guardian_email must be different".
      const loc = Array.isArray(raw.loc) ? raw.loc : [];
      const field = loc.length >= 2 ? loc[1] : undefined;
      if (isField(field)) {
        if (!fieldErrors[field]) fieldErrors[field] = msg;
      } else {
        formErrors.push(msg);
      }
    }
  } else if (typeof issues === "string") {
    formErrors.push(issues);
  }

  return { fieldErrors, formError: formErrors.length ? formErrors.join(" ") : undefined };
}

function parseValidationBody(body: unknown): RegisterLearnerError {
  return { kind: "validation", ...parseLocFieldValidation(body, isLearnerField) };
}

function extractDetailMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string" && detail.trim()) return detail;
  }
  return fallback;
}

/** Maps an HTTP response's status + parsed JSON body to a typed error the UI can render
 * without needing to know FastAPI's response shape. */
export function parseRegisterLearnerError(status: number, body: unknown): RegisterLearnerError {
  if (status === 422) return parseValidationBody(body);
  if (status === 409) {
    return { kind: "conflict", message: extractDetailMessage(body, "An account with these details already exists.") };
  }
  return {
    kind: "server",
    message: extractDetailMessage(body, "Something went wrong on our end. Please try again."),
  };
}

export function networkError(
  message = "Couldn't reach the server. Check your connection and try again.",
): NetworkError {
  return { kind: "network", message };
}

// --- POST /learners/login ---

export type LoginField = "email" | "password";
export type LoginFieldErrors = Partial<Record<LoginField, string>>;

export type LoginError =
  | { kind: "invalid_credentials"; message: string }
  | { kind: "validation"; fieldErrors: LoginFieldErrors; formError?: string }
  | NetworkError
  | { kind: "server"; message: string };

function isLoginField(value: unknown): value is LoginField {
  return value === "email" || value === "password";
}

/** Maps an HTTP response's status + parsed JSON body to a typed login error. A 401 here means
 * "email or password is wrong" — the backend deliberately returns the same message for an
 * unknown email as for a wrong password (see `services/learner_service.py::authenticate` in
 * your-universe-backend), so this can't be used to tell the two apart either. */
export function parseLoginError(status: number, body: unknown): LoginError {
  if (status === 422) return { kind: "validation", ...parseLocFieldValidation(body, isLoginField) };
  if (status === 401) {
    return { kind: "invalid_credentials", message: extractDetailMessage(body, "Invalid email or password.") };
  }
  return {
    kind: "server",
    message: extractDetailMessage(body, "Something went wrong on our end. Please try again."),
  };
}

// --- POST /auth/refresh ---

export type RefreshError =
  | { kind: "invalid_token"; message: string }
  | NetworkError
  | { kind: "server"; message: string };

/** Maps an HTTP response's status + parsed JSON body to a typed refresh error. A 401 covers
 * every rejection reason the backend can return here — expired, malformed, an access token
 * presented in place of a refresh token, or a learner who no longer exists (see
 * `services/auth_service.py::LearnerAuthService.refresh` in your-universe-backend) — the
 * client can't and shouldn't try to distinguish them; the only valid response is "log in
 * again". */
export function parseRefreshError(status: number, body: unknown): RefreshError {
  if (status === 401) {
    return { kind: "invalid_token", message: extractDetailMessage(body, "Your session has expired. Please log in again.") };
  }
  return {
    kind: "server",
    message: extractDetailMessage(body, "Something went wrong on our end. Please try again."),
  };
}

// --- PUT /learners/me/onboarding ---

export type SaveOnboardingError =
  | { kind: "unauthorized"; message: string }
  | { kind: "validation"; message: string }
  /** The backend rejects any write once the profile is already marked complete (see
   * OnboardingService.upsert in your-universe-backend) — onboarding only ever runs once per
   * learner. Not really a "failure" from the learner's point of view: the answers are already
   * saved, there's just nothing new to write (see useOnboardingFlow.ts). */
  | { kind: "already_completed"; message: string }
  | NetworkError
  | { kind: "server"; message: string };

/** Maps an HTTP response's status + parsed JSON body to a typed error for saving the
 * onboarding profile. Unlike login/registration, there's no per-field UI here (the onboarding
 * screens are chip/card pickers, not free-text fields), so a single message is enough. */
export function parseSaveOnboardingError(status: number, body: unknown): SaveOnboardingError {
  if (status === 401) {
    return { kind: "unauthorized", message: extractDetailMessage(body, "Your session has expired. Please log in again.") };
  }
  if (status === 409) {
    return { kind: "already_completed", message: extractDetailMessage(body, "Onboarding is already complete.") };
  }
  if (status === 422) {
    return { kind: "validation", message: extractDetailMessage(body, "Some of your answers couldn't be saved.") };
  }
  return {
    kind: "server",
    message: extractDetailMessage(body, "Something went wrong on our end. Please try again."),
  };
}

// --- GET /learners/me/onboarding ---

export type GetOnboardingError =
  | { kind: "unauthorized"; message: string }
  | NetworkError
  | { kind: "server"; message: string };

/** A 404 here means "no onboarding profile saved yet" — an expected, non-error outcome for a
 * learner who hasn't been through onboarding — so it's handled by the caller
 * (lib/api/onboarding.ts::getOnboardingProfile), not this parser. */
export function parseGetOnboardingError(status: number, body: unknown): GetOnboardingError {
  if (status === 401) {
    return { kind: "unauthorized", message: extractDetailMessage(body, "Your session has expired. Please log in again.") };
  }
  return {
    kind: "server",
    message: extractDetailMessage(body, "Something went wrong on our end. Please try again."),
  };
}
