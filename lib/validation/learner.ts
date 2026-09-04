/** Client-side mirror of the validation rules enforced by the backend
 * (`schemas/learner.py` in your-universe-backend). This exists purely for fast, offline UX
 * feedback — the backend is always the source of truth, and its response errors (see
 * `lib/api/errors.ts`) still get shown even if a rule drifts out of sync or the backend adds
 * a rule this file doesn't know about yet. */

import type { Gender, LearnerField, LearnerRegistrationInput } from "@/lib/api/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[1-9]\d{6,14}$/;
const GENDER_VALUES: Gender[] = ["male", "female", "other", "prefer_not_to_say"];

const MIN_LEARNER_AGE_YEARS = 3;
const MAX_LEARNER_AGE_YEARS = 100;

export function normalizePhoneNumber(value: string): string {
  return value.trim().replace(/[\s-]/g, "");
}

export function validateFullName(value: string): string | undefined {
  if (!value.trim()) return "Full name is required.";
  if (value.trim().length > 255) return "Full name is too long.";
  return undefined;
}

export function validateSchool(value: string): string | undefined {
  if (!value.trim()) return "School is required.";
  if (value.trim().length > 255) return "School name is too long.";
  return undefined;
}

export function validateEmail(value: string, label = "Email"): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required.`;
  if (!EMAIL_PATTERN.test(trimmed)) return `${label} must be a valid email address.`;
  if (trimmed.length > 320) return `${label} is too long.`;
  return undefined;
}

export function validateGender(value: Gender | null): string | undefined {
  if (value === null) return "Please select a gender.";
  if (!GENDER_VALUES.includes(value)) return "Please select a valid gender.";
  return undefined;
}

export function validateDateOfBirth(value: string): string | undefined {
  if (!value.trim()) return "Date of birth is required.";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return "Use the format YYYY-MM-DD.";

  const date = new Date(`${value.trim()}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "That's not a valid date.";

  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  if (date.getTime() > todayUtc) return "Date of birth cannot be in the future.";

  const ageYears = (todayUtc - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (ageYears < MIN_LEARNER_AGE_YEARS) return `Learner must be at least ${MIN_LEARNER_AGE_YEARS} years old.`;
  if (ageYears > MAX_LEARNER_AGE_YEARS) return "That date of birth doesn't look right.";
  return undefined;
}

export function validatePhoneNumber(value: string): string | undefined {
  const normalized = normalizePhoneNumber(value);
  if (!normalized) return "Phone number is required.";
  if (!PHONE_PATTERN.test(normalized)) return "Enter a valid international number, e.g. +27821234567.";
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (value.length > 72) return "Password must be at most 72 characters.";
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return "Password must contain at least one letter and one digit.";
  }
  return undefined;
}

export type LearnerFieldErrors = Partial<Record<LearnerField, string>>;

/** Validates every field, plus the cross-field rule (email !== guardian_email). Returns an
 * empty object when the form is valid. */
export function validateLearnerForm(values: LearnerRegistrationInput): LearnerFieldErrors {
  const errors: LearnerFieldErrors = {};

  const fullName = validateFullName(values.full_name);
  if (fullName) errors.full_name = fullName;

  const email = validateEmail(values.email, "Email");
  if (email) errors.email = email;

  const school = validateSchool(values.school);
  if (school) errors.school = school;

  const gender = validateGender(values.gender);
  if (gender) errors.gender = gender;

  const guardianEmail = validateEmail(values.guardian_email, "Guardian email");
  if (guardianEmail) errors.guardian_email = guardianEmail;

  const dateOfBirth = validateDateOfBirth(values.date_of_birth);
  if (dateOfBirth) errors.date_of_birth = dateOfBirth;

  const phoneNumber = validatePhoneNumber(values.phone_number);
  if (phoneNumber) errors.phone_number = phoneNumber;

  const password = validatePassword(values.password);
  if (password) errors.password = password;

  if (!email && !guardianEmail && values.email.trim().toLowerCase() === values.guardian_email.trim().toLowerCase()) {
    errors.guardian_email = "Guardian email must be different from the learner's email.";
  }

  return errors;
}
