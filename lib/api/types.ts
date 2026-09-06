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

/** Mirrors `schemas/auth.py::LearnerLogin` (your-universe-backend). */
export type LearnerLoginInput = {
  email: string;
  password: string;
};

/** Mirrors `schemas/auth.py::TokenPairRead` — the response shape of both
 * `POST /learners/login` and `POST /auth/refresh`. */
export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  /** Seconds until access_token expires. */
  expires_in: number;
};

/** Mirrors `models/onboarding.py` (your-universe-backend) — kept in sync by hand, same as the
 * other types in this file. */
export type Grade = "9" | "10" | "11" | "12";
export type CareerInterest = "tech" | "health" | "business" | "arts";
export type Pathway = "university" | "tvet" | "private";

/** Mirrors `schemas/onboarding.py::OnboardingProfileUpdate` — every field optional, since a
 * caller may only have answered part of the onboarding flow so far. */
export type OnboardingProfileInput = {
  grade?: Grade;
  strengths?: string[];
  priorities?: string[];
  career_interest?: CareerInterest;
  pathway?: Pathway;
};

/** Mirrors `schemas/onboarding.py::OnboardingProfileRead` — the response shape of both
 * `PUT /learners/me/onboarding` and `GET /learners/me/onboarding`. */
export type OnboardingProfile = {
  learner_id: string;
  grade: Grade | null;
  strengths: string[];
  priorities: string[];
  career_interest: CareerInterest | null;
  pathway: Pathway | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};
