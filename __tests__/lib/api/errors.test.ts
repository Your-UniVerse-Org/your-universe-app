import { networkError, parseRegisterLearnerError } from "@/lib/api/errors";

describe("parseRegisterLearnerError — 422 validation", () => {
  it("maps field-level issues to their field, stripping the 'Value error,' prefix", () => {
    const body = {
      detail: [
        {
          type: "value_error",
          loc: ["body", "phone_number"],
          msg: "Value error, phone_number must be a valid international number, e.g. +27821234567",
        },
        { type: "string_too_short", loc: ["body", "password"], msg: "String should have at least 8 characters" },
      ],
    };

    const error = parseRegisterLearnerError(422, body);

    expect(error.kind).toBe("validation");
    if (error.kind !== "validation") throw new Error("unreachable");
    expect(error.fieldErrors.phone_number).toBe(
      "phone_number must be a valid international number, e.g. +27821234567",
    );
    expect(error.fieldErrors.password).toBe("String should have at least 8 characters");
    expect(error.formError).toBeUndefined();
  });

  it("treats a loc of just ['body'] as a form-level error, not a field error", () => {
    const body = {
      detail: [
        {
          type: "value_error",
          loc: ["body"],
          msg: "Value error, email and guardian_email must be different",
        },
      ],
    };

    const error = parseRegisterLearnerError(422, body);

    expect(error.kind).toBe("validation");
    if (error.kind !== "validation") throw new Error("unreachable");
    expect(error.fieldErrors).toEqual({});
    expect(error.formError).toBe("email and guardian_email must be different");
  });

  it("ignores an unrecognized field name rather than crashing", () => {
    const body = { detail: [{ type: "value_error", loc: ["body", "some_unknown_field"], msg: "bad value" }] };

    const error = parseRegisterLearnerError(422, body);

    expect(error.kind).toBe("validation");
    if (error.kind !== "validation") throw new Error("unreachable");
    expect(error.fieldErrors).toEqual({});
    expect(error.formError).toBe("bad value");
  });

  it("degrades gracefully for a malformed/unexpected body shape", () => {
    const error = parseRegisterLearnerError(422, { unexpected: true });
    expect(error.kind).toBe("validation");
    if (error.kind !== "validation") throw new Error("unreachable");
    expect(error.fieldErrors).toEqual({});
  });
});

describe("parseRegisterLearnerError — 409 conflict", () => {
  it("surfaces the backend's detail message", () => {
    const error = parseRegisterLearnerError(409, { detail: "Learner with email 'a@b.com' already exists" });
    expect(error).toEqual({ kind: "conflict", message: "Learner with email 'a@b.com' already exists" });
  });

  it("falls back to a generic message when detail is missing", () => {
    const error = parseRegisterLearnerError(409, {});
    expect(error.kind).toBe("conflict");
    if (error.kind !== "conflict") throw new Error("unreachable");
    expect(error.message).toMatch(/already exists/i);
  });
});

describe("parseRegisterLearnerError — other statuses", () => {
  it("maps a 500 to a generic server error", () => {
    const error = parseRegisterLearnerError(500, null);
    expect(error.kind).toBe("server");
  });

  it("uses a string detail on a 500 if present", () => {
    const error = parseRegisterLearnerError(500, { detail: "Internal Server Error" });
    expect(error).toEqual({ kind: "server", message: "Internal Server Error" });
  });
});

describe("networkError", () => {
  it("has a sensible default message", () => {
    expect(networkError().kind).toBe("network");
    expect(networkError().message.length).toBeGreaterThan(0);
  });
});
