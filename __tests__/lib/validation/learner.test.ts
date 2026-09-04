import {
  normalizePhoneNumber,
  validateDateOfBirth,
  validateEmail,
  validateFullName,
  validateGender,
  validateLearnerForm,
  validatePassword,
  validatePhoneNumber,
  validateSchool,
} from "@/lib/validation/learner";
import type { LearnerRegistrationInput } from "@/lib/api/types";

const VALID_FORM: LearnerRegistrationInput = {
  full_name: "Amara Nwosu",
  email: "amara.nwosu@example.com",
  school: "Riverbend High School",
  gender: "female",
  guardian_email: "guardian.nwosu@example.com",
  date_of_birth: "2012-05-14",
  phone_number: "+27821234567",
  password: "Sup3rSecret!",
};

describe("validateFullName", () => {
  it("rejects empty/whitespace-only names", () => {
    expect(validateFullName("")).toBeDefined();
    expect(validateFullName("   ")).toBeDefined();
  });

  it("accepts a normal name", () => {
    expect(validateFullName("Amara Nwosu")).toBeUndefined();
  });
});

describe("validateSchool", () => {
  it("rejects empty school", () => {
    expect(validateSchool("")).toBeDefined();
  });

  it("accepts a normal school", () => {
    expect(validateSchool("Riverbend High School")).toBeUndefined();
  });
});

describe("validateEmail", () => {
  it("rejects empty email", () => {
    expect(validateEmail("")).toBeDefined();
  });

  it("rejects malformed email", () => {
    expect(validateEmail("not-an-email")).toBeDefined();
  });

  it("accepts a valid email", () => {
    expect(validateEmail("amara@example.com")).toBeUndefined();
  });
});

describe("validateGender", () => {
  it("rejects null (nothing selected)", () => {
    expect(validateGender(null)).toBeDefined();
  });

  it("accepts each known gender value", () => {
    for (const value of ["male", "female", "other", "prefer_not_to_say"] as const) {
      expect(validateGender(value)).toBeUndefined();
    }
  });
});

describe("validateDateOfBirth", () => {
  it("rejects an empty value", () => {
    expect(validateDateOfBirth("")).toBeDefined();
  });

  it("rejects a malformed date", () => {
    expect(validateDateOfBirth("14/05/2012")).toBeDefined();
  });

  it("rejects a future date", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const iso = future.toISOString().slice(0, 10);
    expect(validateDateOfBirth(iso)).toBeDefined();
  });

  it("rejects a learner younger than 3", () => {
    const today = new Date();
    const tooYoung = new Date(Date.UTC(today.getUTCFullYear() - 1, today.getUTCMonth(), today.getUTCDate()));
    expect(validateDateOfBirth(tooYoung.toISOString().slice(0, 10))).toBeDefined();
  });

  it("rejects an implausibly old date", () => {
    expect(validateDateOfBirth("1900-01-01")).toBeDefined();
  });

  it("accepts a plausible birth date", () => {
    expect(validateDateOfBirth("2012-05-14")).toBeUndefined();
  });
});

describe("normalizePhoneNumber / validatePhoneNumber", () => {
  it("strips spaces and hyphens", () => {
    expect(normalizePhoneNumber("+27 82 123-4567")).toBe("+27821234567");
  });

  it("rejects a too-short number", () => {
    expect(validatePhoneNumber("123")).toBeDefined();
  });

  it("rejects a non-numeric number", () => {
    expect(validatePhoneNumber("not-a-phone")).toBeDefined();
  });

  it("accepts a valid international number, spaced or not", () => {
    expect(validatePhoneNumber("+27821234567")).toBeUndefined();
    expect(validatePhoneNumber("+27 82 123 4567")).toBeUndefined();
  });
});

describe("validatePassword", () => {
  it("rejects a too-short password", () => {
    expect(validatePassword("a1")).toBeDefined();
  });

  it("rejects a password with no digit", () => {
    expect(validatePassword("allletters")).toBeDefined();
  });

  it("rejects a password with no letter", () => {
    expect(validatePassword("12345678")).toBeDefined();
  });

  it("rejects a password over 72 characters", () => {
    expect(validatePassword("a1".repeat(40))).toBeDefined();
  });

  it("accepts a strong password", () => {
    expect(validatePassword("Sup3rSecret!")).toBeUndefined();
  });
});

describe("validateLearnerForm", () => {
  it("returns no errors for a fully valid form", () => {
    expect(validateLearnerForm(VALID_FORM)).toEqual({});
  });

  it("collects one error per invalid field", () => {
    const errors = validateLearnerForm({ ...VALID_FORM, full_name: "", phone_number: "123" });
    expect(errors.full_name).toBeDefined();
    expect(errors.phone_number).toBeDefined();
    expect(Object.keys(errors)).toHaveLength(2);
  });

  it("rejects a guardian email matching the learner's own email", () => {
    const errors = validateLearnerForm({ ...VALID_FORM, guardian_email: VALID_FORM.email });
    expect(errors.guardian_email).toBeDefined();
  });

  it("is case-insensitive when comparing email and guardian_email", () => {
    const errors = validateLearnerForm({ ...VALID_FORM, guardian_email: VALID_FORM.email.toUpperCase() });
    expect(errors.guardian_email).toBeDefined();
  });
});
