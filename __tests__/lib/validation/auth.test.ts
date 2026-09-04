import type { LearnerLoginInput } from "@/lib/api/types";
import { validateLoginForm, validateLoginPassword } from "@/lib/validation/auth";

const VALID_FORM: LearnerLoginInput = {
  email: "amara.nwosu@example.com",
  password: "anything-already-registered",
};

describe("validateLoginPassword", () => {
  it("rejects an empty password", () => {
    expect(validateLoginPassword("")).toBeDefined();
  });

  it("accepts any non-empty password, regardless of complexity", () => {
    // Unlike registration, login must accept an existing password as typed — even one that
    // wouldn't pass today's registration complexity rule.
    expect(validateLoginPassword("short")).toBeUndefined();
    expect(validateLoginPassword("Sup3rSecret!")).toBeUndefined();
  });
});

describe("validateLoginForm", () => {
  it("accepts a valid form", () => {
    expect(validateLoginForm(VALID_FORM)).toEqual({});
  });

  it("rejects a missing email", () => {
    const errors = validateLoginForm({ ...VALID_FORM, email: "" });
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeUndefined();
  });

  it("rejects a malformed email", () => {
    const errors = validateLoginForm({ ...VALID_FORM, email: "not-an-email" });
    expect(errors.email).toBeDefined();
  });

  it("rejects a missing password", () => {
    const errors = validateLoginForm({ ...VALID_FORM, password: "" });
    expect(errors.password).toBeDefined();
    expect(errors.email).toBeUndefined();
  });
});
