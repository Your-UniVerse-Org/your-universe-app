import { loginLearner, refreshLearnerToken } from "@/lib/api/auth";
import type { LearnerLoginInput, TokenPair } from "@/lib/api/types";

const VALID_LOGIN: LearnerLoginInput = {
  email: "amara.nwosu@example.com",
  password: "Sup3rSecret!",
};

const TOKENS: TokenPair = {
  access_token: "access.jwt.token",
  refresh_token: "refresh.jwt.token",
  token_type: "bearer",
  expires_in: 900,
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
  process.env.EXPO_PUBLIC_API_BASE_URL = "http://test-backend.local:8000";
});

afterEach(() => {
  process.env.EXPO_PUBLIC_API_BASE_URL = ORIGINAL_ENV;
  jest.restoreAllMocks();
});

describe("loginLearner", () => {
  it("POSTs to <base url>/learners/login with the JSON payload and correct headers", async () => {
    const fetchMock = mockFetchOnce(200, TOKENS);

    await loginLearner(VALID_LOGIN);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://test-backend.local:8000/learners/login");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
    expect(JSON.parse(init.body)).toEqual(VALID_LOGIN);
  });

  it("returns ok:true with the token pair on 200", async () => {
    mockFetchOnce(200, TOKENS);

    const result = await loginLearner(VALID_LOGIN);

    expect(result).toEqual({ ok: true, tokens: TOKENS });
  });

  it("returns an invalid_credentials error on 401", async () => {
    mockFetchOnce(401, { detail: "Invalid email or password" }, false);

    const result = await loginLearner(VALID_LOGIN);

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("unreachable");
    expect(result.error).toEqual({ kind: "invalid_credentials", message: "Invalid email or password" });
  });

  it("returns identical errors for an unknown email and a wrong password (both 401)", async () => {
    mockFetchOnce(401, { detail: "Invalid email or password" }, false);
    const unknownEmailResult = await loginLearner(VALID_LOGIN);

    mockFetchOnce(401, { detail: "Invalid email or password" }, false);
    const wrongPasswordResult = await loginLearner({ ...VALID_LOGIN, password: "WrongPassword1" });

    expect(unknownEmailResult).toEqual(wrongPasswordResult);
  });

  it("returns a validation error on 422", async () => {
    mockFetchOnce(422, { detail: [{ type: "value_error", loc: ["body", "email"], msg: "invalid email" }] }, false);

    const result = await loginLearner(VALID_LOGIN);

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("unreachable");
    expect(result.error).toEqual({ kind: "validation", fieldErrors: { email: "invalid email" }, formError: undefined });
  });

  it("returns a server error on 500", async () => {
    mockFetchOnce(500, { detail: "boom" }, false);

    const result = await loginLearner(VALID_LOGIN);

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("unreachable");
    expect(result.error).toEqual({ kind: "server", message: "boom" });
  });

  it("returns a network error when fetch itself throws", async () => {
    (globalThis as unknown as { fetch: typeof fetch }).fetch = jest
      .fn()
      .mockRejectedValue(new Error("Network request failed")) as unknown as typeof fetch;

    const result = await loginLearner(VALID_LOGIN);

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

    const result = await loginLearner(VALID_LOGIN);

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("unreachable");
    expect(result.error.kind).toBe("server");
  });
});

describe("refreshLearnerToken", () => {
  it("POSTs to <base url>/auth/refresh with { refresh_token } and correct headers", async () => {
    const fetchMock = mockFetchOnce(200, TOKENS);

    await refreshLearnerToken("refresh.jwt.token");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://test-backend.local:8000/auth/refresh");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ refresh_token: "refresh.jwt.token" });
  });

  it("returns ok:true with the new token pair on 200", async () => {
    mockFetchOnce(200, TOKENS);

    const result = await refreshLearnerToken("refresh.jwt.token");

    expect(result).toEqual({ ok: true, tokens: TOKENS });
  });

  it("returns an invalid_token error on 401 (expired, wrong type, or malformed)", async () => {
    mockFetchOnce(401, { detail: "Invalid or expired refresh token" }, false);

    const result = await refreshLearnerToken("stale-token");

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("unreachable");
    expect(result.error).toEqual({ kind: "invalid_token", message: "Invalid or expired refresh token" });
  });

  it("returns a network error when fetch itself throws", async () => {
    (globalThis as unknown as { fetch: typeof fetch }).fetch = jest
      .fn()
      .mockRejectedValue(new Error("Network request failed")) as unknown as typeof fetch;

    const result = await refreshLearnerToken("refresh.jwt.token");

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("unreachable");
    expect(result.error.kind).toBe("network");
  });
});
