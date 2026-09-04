import { getApiBaseUrl } from "@/lib/api/config";

const ORIGINAL_ENV = process.env.EXPO_PUBLIC_API_BASE_URL;

afterEach(() => {
  process.env.EXPO_PUBLIC_API_BASE_URL = ORIGINAL_ENV;
});

describe("getApiBaseUrl", () => {
  it("returns the configured value", () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = "http://192.168.16.100:8000";
    expect(getApiBaseUrl()).toBe("http://192.168.16.100:8000");
  });

  it("strips a trailing slash", () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = "http://192.168.16.100:8000/";
    expect(getApiBaseUrl()).toBe("http://192.168.16.100:8000");
  });

  it("trims surrounding whitespace", () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = "  http://192.168.16.100:8000  ";
    expect(getApiBaseUrl()).toBe("http://192.168.16.100:8000");
  });

  it("throws a clear error when unset, rather than silently defaulting", () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    expect(() => getApiBaseUrl()).toThrow(/EXPO_PUBLIC_API_BASE_URL/);
  });

  it("throws when set to an empty/whitespace-only string", () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = "   ";
    expect(() => getApiBaseUrl()).toThrow(/EXPO_PUBLIC_API_BASE_URL/);
  });
});
