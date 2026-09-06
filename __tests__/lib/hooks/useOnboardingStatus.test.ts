import { act, renderHook } from "@testing-library/react-native";
import { useSession } from "@/components/SessionContext";
import { getOnboardingProfile } from "@/lib/api/onboarding";
import type { OnboardingProfile } from "@/lib/api/types";
import { useOnboardingStatus } from "@/lib/hooks/useOnboardingStatus";

jest.mock("@/components/SessionContext");
jest.mock("@/lib/api/onboarding");

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockGetOnboardingProfile = getOnboardingProfile as jest.MockedFunction<typeof getOnboardingProfile>;

const COMPLETE_PROFILE: OnboardingProfile = {
  learner_id: "abc-123",
  grade: "11",
  strengths: ["Creativity"],
  priorities: ["Location"],
  career_interest: "tech",
  pathway: "university",
  completed_at: "2026-01-01T00:00:00Z",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const INCOMPLETE_PROFILE: OnboardingProfile = { ...COMPLETE_PROFILE, completed_at: null };

afterEach(() => {
  mockUseSession.mockReset();
  mockGetOnboardingProfile.mockReset();
});

describe("useOnboardingStatus", () => {
  it("stays loading while the session itself is still loading", async () => {
    mockUseSession.mockReturnValue({ status: "loading", accessToken: null, login: jest.fn(), logout: jest.fn() });

    const { result } = await renderHook(() => useOnboardingStatus());
    await act(async () => {});

    expect(result.current).toBe("loading");
    expect(mockGetOnboardingProfile).not.toHaveBeenCalled();
  });

  it("is unknown when there is no access token (signed out)", async () => {
    mockUseSession.mockReturnValue({ status: "signedOut", accessToken: null, login: jest.fn(), logout: jest.fn() });

    const { result } = await renderHook(() => useOnboardingStatus());
    await act(async () => {});

    expect(result.current).toBe("unknown");
    expect(mockGetOnboardingProfile).not.toHaveBeenCalled();
  });

  it("is complete once the backend reports a completed_at", async () => {
    mockUseSession.mockReturnValue({
      status: "signedIn",
      accessToken: "access.jwt.token",
      login: jest.fn(),
      logout: jest.fn(),
    });
    mockGetOnboardingProfile.mockResolvedValue({ ok: true, profile: COMPLETE_PROFILE });

    const { result } = await renderHook(() => useOnboardingStatus());
    await act(async () => {});

    expect(mockGetOnboardingProfile).toHaveBeenCalledWith("access.jwt.token");
    expect(result.current).toBe("complete");
  });

  it("is incomplete when a profile exists but isn't marked complete", async () => {
    mockUseSession.mockReturnValue({
      status: "signedIn",
      accessToken: "access.jwt.token",
      login: jest.fn(),
      logout: jest.fn(),
    });
    mockGetOnboardingProfile.mockResolvedValue({ ok: true, profile: INCOMPLETE_PROFILE });

    const { result } = await renderHook(() => useOnboardingStatus());
    await act(async () => {});

    expect(result.current).toBe("incomplete");
  });

  it("is incomplete when no profile has been saved yet (404 → profile: null)", async () => {
    mockUseSession.mockReturnValue({
      status: "signedIn",
      accessToken: "access.jwt.token",
      login: jest.fn(),
      logout: jest.fn(),
    });
    mockGetOnboardingProfile.mockResolvedValue({ ok: true, profile: null });

    const { result } = await renderHook(() => useOnboardingStatus());
    await act(async () => {});

    expect(result.current).toBe("incomplete");
  });

  it("is unknown when the request fails", async () => {
    mockUseSession.mockReturnValue({
      status: "signedIn",
      accessToken: "access.jwt.token",
      login: jest.fn(),
      logout: jest.fn(),
    });
    mockGetOnboardingProfile.mockResolvedValue({
      ok: false,
      error: { kind: "network", message: "Couldn't reach the server. Check your connection and try again." },
    });

    const { result } = await renderHook(() => useOnboardingStatus());
    await act(async () => {});

    expect(result.current).toBe("unknown");
  });
});
