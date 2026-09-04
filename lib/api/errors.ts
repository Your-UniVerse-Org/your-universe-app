import type { LearnerField } from "@/lib/api/types";

export type LearnerFieldErrors = Partial<Record<LearnerField, string>>;

export type RegisterLearnerError =
  | { kind: "validation"; fieldErrors: LearnerFieldErrors; formError?: string }
  | { kind: "conflict"; message: string }
  | { kind: "network"; message: string }
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

function parseValidationBody(body: unknown): RegisterLearnerError {
  const fieldErrors: LearnerFieldErrors = {};
  const formErrors: string[] = [];

  const issues = body && typeof body === "object" && "detail" in body ? (body as { detail: unknown }).detail : null;

  if (Array.isArray(issues)) {
    for (const raw of issues as FastApiValidationIssue[]) {
      const msg = typeof raw.msg === "string" ? stripValueErrorPrefix(raw.msg) : "Invalid value.";
      // loc is ["body", "<field>", ...] for a field-specific error, or just ["body"] for a
      // cross-field (model-level) error such as "email and guardian_email must be different".
      const loc = Array.isArray(raw.loc) ? raw.loc : [];
      const field = loc.length >= 2 ? loc[1] : undefined;
      if (isLearnerField(field)) {
        if (!fieldErrors[field]) fieldErrors[field] = msg;
      } else {
        formErrors.push(msg);
      }
    }
  } else if (typeof issues === "string") {
    formErrors.push(issues);
  }

  return {
    kind: "validation",
    fieldErrors,
    formError: formErrors.length ? formErrors.join(" ") : undefined,
  };
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
): Extract<RegisterLearnerError, { kind: "network" }> {
  return { kind: "network", message };
}
