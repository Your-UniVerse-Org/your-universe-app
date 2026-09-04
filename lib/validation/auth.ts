/** Client-side mirror of the (minimal) validation `POST /learners/login` expects
 * (`schemas/auth.py::LearnerLogin` in your-universe-backend). Unlike registration, login
 * deliberately does NOT re-check password complexity — an existing account's password must be
 * accepted as typed; only "something was entered" is checked here. Backend is authoritative;
 * this exists purely for fast, offline UX feedback (same rationale as
 * `lib/validation/learner.ts`). */

import type { LearnerLoginInput } from "@/lib/api/types";
import { validateEmail } from "@/lib/validation/learner";

export type LoginFieldErrors = Partial<Record<keyof LearnerLoginInput, string>>;

export function validateLoginPassword(value: string): string | undefined {
  if (!value) return "Password is required.";
  return undefined;
}

/** Validates every field. Returns an empty object when the form is valid. */
export function validateLoginForm(values: LearnerLoginInput): LoginFieldErrors {
  const errors: LoginFieldErrors = {};

  const email = validateEmail(values.email, "Email");
  if (email) errors.email = email;

  const password = validateLoginPassword(values.password);
  if (password) errors.password = password;

  return errors;
}
