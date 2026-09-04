import { registerLearner } from "@/lib/api/learners";
import type { LearnerRegistrationInput } from "@/lib/api/types";

const VALID_INPUT: LearnerRegistrationInput = {
  full_name: "Amara Nwosu",
  email: "amara.nwosu@example.com",
  school: "Riverbend High School",
  gender: "female",
  guardian_email: "guardian.nwosu@example.com",
  date_of_birth: "2012-05-14",
  phone_number: "+27821234567",
  password: "Sup3rSecret!",
};

function mockFetchOnce(status: number, body: unknown, ok = status >= 200 && status < 300) {
  const fetchMock = jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body,
  });
  (globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

const ORIGINAL_ENV = process.env.EXPO_PUBLIC_API_BASE_URL;

beforeEach(() => {
  // getApiBaseUrl() throws if this is unset — Jest doesn't load .env/.env.local the way
  // Expo's dev server does, so every test needs it set explicitly.
  process.env.EXPO_PUBLIC_API_BASE_URL = "http://test-backend.local:8000";
});

afterEach(() => {
  process.env.EXPO_PUBLIC_API_BASE_URL = ORIGINAL_ENV;
  jest.restoreAllMocks();
});

describe("registerLearner", () => {
  it("POSTs to <base url>/learners with the JSON payload and correct headers", async () => {
    const fetchMock = mockFetchOnce(201, { id: "1", ...VALID_INPUT });

    await registerLearner(VALID_INPUT);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://test-backend.local:8000/learners");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
    expect(JSON.parse(init.body)).toEqual(VALID_INPUT);
  });

  it("returns ok:true with the created learner on 201", async () => {
    const learner = { id: "abc-123", ...VALID_INPUT };
    mockFetchOnce(201, learner);

    const result = await registerLearner(VALID_INPUT);

    expect(result).toEqual({ ok: true, learner });
  });

  it("returns a validation error on 422", async () => {
    mockFetchOnce(422, { detail: [{ type: "value_error", loc: ["body", "email"], msg: "invalid email" }] }, false);

    const result = await registerLearner(VALID_INPUT);

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("unreachable");
    expect(result.error.kind).toBe("validation");
  });

  it("returns a conflict error on 409", async () => {
    mockFetchOnce(409, { detail: "Learner with email 'x' already exists" }, false);

    const result = await registerLearner(VALID_INPUT);

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("unreachable");
    expect(result.error).toEqual({ kind: "conflict", message: "Learner with email 'x' already exists" });
  });

  it("returns a server error on 500", async () => {
    mockFetchOnce(500, { detail: "boom" }, false);

    const result = await registerLearner(VALID_INPUT);

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("unreachable");
    expect(result.error).toEqual({ kind: "server", message: "boom" });
  });

  it("returns a network error when fetch itself throws (offline, DNS failure, etc.)", async () => {
    (globalThis as unknown as { fetch: typeof fetch }).fetch = jest
      .fn()
      .mockRejectedValue(new Error("Network request failed")) as unknown as typeof fetch;

    const result = await registerLearner(VALID_INPUT);

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("unreachable");
    expect(result.error.kind).toBe("network");
  });

  it("does not throw when the error response body isn't valid JSON", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => {
        throw new SyntaxError("Unexpected token < in JSON");
      },
    });
    (globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;

    const result = await registerLearner(VALID_INPUT);

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("unreachable");
    expect(result.error.kind).toBe("server");
  });
});
