/** Shared types for the learner-registration API surface — kept in sync by hand with the
 * backend's `schemas/learner.py` (your-universe-backend). */

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

/** One entry per field on the registration form — used for both client-side validation
 * errors and server-side field errors, so both can be rendered the same way. */
export type LearnerField =
  | "full_name"
  | "email"
  | "school"
  | "gender"
  | "guardian_email"
  | "date_of_birth"
  | "phone_number"
  | "password";

export type LearnerRegistrationInput = {
  full_name: string;
  email: string;
  school: string;
  gender: Gender | null;
  guardian_email: string;
  /** ISO date string, "YYYY-MM-DD". */
  date_of_birth: string;
  phone_number: string;
  password: string;
};

export type Learner = {
  id: string;
  full_name: string;
  email: string;
  school: string;
  gender: Gender;
  guardian_email: string;
  date_of_birth: string;
  phone_number: string;
  created_at: string;
  updated_at: string;
};
