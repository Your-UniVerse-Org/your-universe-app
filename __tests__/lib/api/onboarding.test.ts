import { getOnboardingProfile, saveOnboardingProfile } from "@/lib/api/onboarding";
import type { OnboardingProfile, OnboardingProfileInput } from "@/lib/api/types";

const INPUT: OnboardingProfileInput = {
  grade: "11",
  strengths: ["Creativity", "Teamwork"],
  priorities: ["Location"],
  career_interest: "tech",
  pathway: "university",
};

const PROFILE: OnboardingProfile = {
  learner_id: "abc-123",
  grade: "11",
  strengths: ["Creativity", "Teamwork"],
  priorities: ["Location"],
  career_interest: "tech",
  pathway: "university",
  completed_at: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
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

describe("saveOnboardingProfile", () => {
  it("PUTs to <base url>/learners/me/onboarding with the payload, auth header, and correct method", async () => {
    const fetchMock = mockFetchOnce(200, PROFILE);

    await saveOnboardingProfile("access.jwt.token", INPUT);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://test-backend.local:8000/learners/me/onboarding");
    expect(init.method).toBe("PUT");
    expect(init.headers).toMatchObject({
      "Content-Type": "application/json",
      Authorization: "Bearer access.jwt.token",
    });
    expect(JSON.parse(init.body)).toEqual(INPUT);
  });

  it("returns ok:true with the saved profile on 200", async () => {
    mockFetchOnce(200, PROFILE);

    const result = await saveOnboardingProfile("access.jwt.token", INPUT);

    expect(result).toEqual({ ok: true, profile: PROFILE });
  });

  it("returns an unauthorized error on 401", async () => {
    mockFetchOnce(401, { detail: "Invalid or expired token" }, false);

    const result = await saveOnboardingProfile("stale-token", INPUT);

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("unreachable");
    expect(result.error).toEqual({ kind: "unauthorized", message: "Invalid or expired token" });
  });

  it("returns a validation error on 422", async () => {
    mockFetchOnce(422, { detail: "Unknown strengths: ['Not A Real Strength']" }, false);

    const result = await saveOnboardingProfile("access.jwt.token", INPUT);

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("unreachable");
    expect(result.error.kind).toBe("validation");
  });

  it("returns an already_completed error on 409", async () => {
    mockFetchOnce(409, { detail: "Onboarding profile for learner '...' is already completed" }, false);

    const result = await saveOnboardingProfile("access.jwt.token", INPUT);

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("unreachable");
    expect(result.error.kind).toBe("already_completed");
  });

  it("returns a server error on 500", async () => {
    mockFetchOnce(500, { detail: "boom" }, false);

    const result = await saveOnboardingProfile("access.jwt.token", INPUT);

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("unreachable");
    expect(result.error).toEqual({ kind: "server", message: "boom" });
  });

  it("returns a network error when fetch itself throws", async () => {
    (globalThis as unknown as { fetch: typeof fetch }).fetch = jest
      .fn()
      .mockRejectedValue(new Error("Network request failed")) as unknown as typeof fetch;

    const result = await saveOnboardingProfile("access.jwt.token", INPUT);

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

    const result = await saveOnboardingProfile("access.jwt.token", INPUT);

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("unreachable");
    expect(result.error.kind).toBe("server");
  });
});

describe("getOnboardingProfile", () => {
  it("GETs <base url>/learners/me/onboarding with the auth header", async () => {
    const fetchMock = mockFetchOnce(200, PROFILE);

    await getOnboardingProfile("access.jwt.token");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://test-backend.local:8000/learners/me/onboarding");
    expect(init.method).toBe("GET");
    expect(init.headers).toMatchObject({ Authorization: "Bearer access.jwt.token" });
  });

  it("returns ok:true with the profile on 200", async () => {
    mockFetchOnce(200, PROFILE);

    const result = await getOnboardingProfile("access.jwt.token");

    expect(result).toEqual({ ok: true, profile: PROFILE });
  });

  it("returns ok:true with profile:null on 404 (no onboarding profile saved yet)", async () => {
    mockFetchOnce(404, { detail: "not found" }, false);

    const result = await getOnboardingProfile("access.jwt.token");

    expect(result).toEqual({ ok: true, profile: null });
  });

  it("returns an unauthorized error on 401", async () => {
    mockFetchOnce(401, { detail: "Invalid or expired token" }, false);

    const result = await getOnboardingProfile("stale-token");

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("unreachable");
    expect(result.error).toEqual({ kind: "unauthorized", message: "Invalid or expired token" });
  });

  it("returns a server error on 500", async () => {
    mockFetchOnce(500, { detail: "boom" }, false);

    const result = await getOnboardingProfile("access.jwt.token");

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("unreachable");
    expect(result.error).toEqual({ kind: "server", message: "boom" });
  });

  it("returns a network error when fetch itself throws", async () => {
    (globalThis as unknown as { fetch: typeof fetch }).fetch = jest
      .fn()
      .mockRejectedValue(new Error("Network request failed")) as unknown as typeof fetch;

    const result = await getOnboardingProfile("access.jwt.token");

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("unreachable");
    expect(result.error.kind).toBe("network");
  });
});
