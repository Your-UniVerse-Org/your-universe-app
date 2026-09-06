import { act, renderHook } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useSession } from "@/components/SessionContext";
import { saveOnboardingProfile } from "@/lib/api/onboarding";
import type { OnboardingProfile } from "@/lib/api/types";
import { useOnboardingFlow } from "@/lib/hooks/useOnboardingFlow";
import { ONBOARDING_STEPS } from "@/lib/onboarding-steps";
import { clearOnboardingProgress, loadOnboardingProgress, saveOnboardingProgress } from "@/lib/onboarding/storage";

jest.mock("expo-router", () => ({ useRouter: jest.fn() }));
jest.mock("@/components/SessionContext");
jest.mock("@/lib/api/onboarding");
jest.mock("@/lib/onboarding/storage");

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockSaveOnboardingProfile = saveOnboardingProfile as jest.MockedFunction<typeof saveOnboardingProfile>;
const mockLoadOnboardingProgress = loadOnboardingProgress as jest.MockedFunction<typeof loadOnboardingProgress>;
const mockSaveOnboardingProgress = saveOnboardingProgress as jest.MockedFunction<typeof saveOnboardingProgress>;
const mockClearOnboardingProgress = clearOnboardingProgress as jest.MockedFunction<typeof clearOnboardingProgress>;
const mockReplace = jest.fn();

const GRADE_STEP = ONBOARDING_STEPS.findIndex((step) => step.kind === "grade");
const STRENGTHS_STEP = ONBOARDING_STEPS.findIndex((step) => step.kind === "strengths");
const PRIORITIES_STEP = ONBOARDING_STEPS.findIndex((step) => step.kind === "priorities");
const CAREERS_STEP = ONBOARDING_STEPS.findIndex((step) => step.kind === "careers");
const PATHWAY_STEP = ONBOARDING_STEPS.findIndex((step) => step.kind === "pathway");
const SUMMARY_STEP = ONBOARDING_STEPS.findIndex((step) => step.kind === "summary");

type Result = { current: ReturnType<typeof useOnboardingFlow> };

/** Calls next() `count` times, awaiting each so state updates settle before the next call —
 * mirrors fillValidForm() in useLearnerLogin.test.ts/useLearnerRegistration.test.ts. */
async function advance(result: Result, count: number) {
  for (let i = 0; i < count; i++) {
    await act(async () => {
      result.current.next();
    });
  }
}

beforeEach(() => {
  mockUseRouter.mockReturnValue({ replace: mockReplace } as unknown as ReturnType<typeof useRouter>);
  mockUseSession.mockReturnValue({
    status: "signedIn",
    accessToken: "access.jwt.token",
    login: jest.fn(),
    logout: jest.fn(),
  });
  mockLoadOnboardingProgress.mockResolvedValue(null);
  mockSaveOnboardingProgress.mockResolvedValue(undefined);
  mockClearOnboardingProgress.mockResolvedValue(undefined);
  mockSaveOnboardingProfile.mockResolvedValue({ ok: true, profile: {} as OnboardingProfile });
});

afterEach(() => {
  // Scoped to our own mocks only — jest.resetAllMocks() would also reset jest-expo's internal
  // native-module mocks that renderHook()/act() rely on (see useLearnerLogin.test.ts).
  mockReplace.mockReset();
  mockUseRouter.mockReset();
  mockUseSession.mockReset();
  mockSaveOnboardingProfile.mockReset();
  mockLoadOnboardingProgress.mockReset();
  mockSaveOnboardingProgress.mockReset();
  mockClearOnboardingProgress.mockReset();
});

describe("useOnboardingFlow", () => {
  it("resumes previously stored progress on mount", async () => {
    mockLoadOnboardingProgress.mockResolvedValue({
      stepIndex: GRADE_STEP,
      selections: { [GRADE_STEP]: ["10"] },
    });

    const { result } = await renderHook(() => useOnboardingFlow());
    await act(async () => {});

    expect(result.current.stepIndex).toBe(GRADE_STEP);
    expect(result.current.selected).toEqual(["10"]);
  });

  it("persists progress to on-device storage after every change once hydrated", async () => {
    const { result } = await renderHook(() => useOnboardingFlow());
    await act(async () => {});
    mockSaveOnboardingProgress.mockClear(); // drop the initial post-hydration persist call

    await advance(result, 1);

    expect(mockSaveOnboardingProgress).toHaveBeenCalledWith({ stepIndex: 1, selections: {} });
  });

  it("toggle replaces a single-select answer", async () => {
    const { result } = await renderHook(() => useOnboardingFlow());
    await act(async () => {});
    await advance(result, GRADE_STEP);

    await act(async () => {
      result.current.toggle("10");
    });
    await act(async () => {
      result.current.toggle("11");
    });

    expect(result.current.selected).toEqual(["11"]);
  });

  it("toggle accumulates and removes multi-select answers", async () => {
    const { result } = await renderHook(() => useOnboardingFlow());
    await act(async () => {});
    await advance(result, STRENGTHS_STEP);

    await act(async () => {
      result.current.toggle("Creativity", true);
    });
    await act(async () => {
      result.current.toggle("Teamwork", true);
    });
    expect(result.current.selected).toEqual(["Creativity", "Teamwork"]);

    await act(async () => {
      result.current.toggle("Creativity", true);
    });
    expect(result.current.selected).toEqual(["Teamwork"]);
  });

  it("back moves to the previous step, and does nothing on the first step", async () => {
    const { result } = await renderHook(() => useOnboardingFlow());
    await act(async () => {});
    await advance(result, 2);

    await act(async () => {
      result.current.back();
    });
    expect(result.current.stepIndex).toBe(1);

    await act(async () => {
      result.current.back();
    });
    await act(async () => {
      result.current.back();
    });
    expect(result.current.stepIndex).toBe(0);
  });

  it("skip clears stored progress and navigates home", async () => {
    const { result } = await renderHook(() => useOnboardingFlow());
    await act(async () => {});

    await act(async () => {
      result.current.skip();
    });

    expect(mockClearOnboardingProgress).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith("/home");
  });

  it("next() at the final step navigates home instead of advancing further", async () => {
    const { result } = await renderHook(() => useOnboardingFlow());
    await act(async () => {});
    await advance(result, ONBOARDING_STEPS.length - 1);

    await advance(result, 1);

    expect(mockReplace).toHaveBeenCalledWith("/home");
  });

  it("submits the collected answers once the summary step is reached, then clears local progress", async () => {
    mockSaveOnboardingProfile.mockResolvedValue({ ok: true, profile: {} as OnboardingProfile });
    const { result } = await renderHook(() => useOnboardingFlow());
    await act(async () => {});

    await advance(result, GRADE_STEP);
    await act(async () => {
      result.current.toggle("10");
    });
    await advance(result, STRENGTHS_STEP - GRADE_STEP);
    await act(async () => {
      result.current.toggle("Creativity", true);
    });
    await advance(result, PRIORITIES_STEP - STRENGTHS_STEP);
    await act(async () => {
      result.current.toggle("Location", true);
    });
    await advance(result, CAREERS_STEP - PRIORITIES_STEP);
    await act(async () => {
      result.current.toggle("tech");
    });
    await advance(result, PATHWAY_STEP - CAREERS_STEP);
    await act(async () => {
      result.current.toggle("university");
    });
    await advance(result, SUMMARY_STEP - PATHWAY_STEP);

    expect(mockSaveOnboardingProfile).toHaveBeenCalledTimes(1);
    expect(mockSaveOnboardingProfile).toHaveBeenCalledWith("access.jwt.token", {
      grade: "10",
      strengths: ["Creativity"],
      priorities: ["Location"],
      career_interest: "tech",
      pathway: "university",
    });

    await act(async () => {});
    expect(mockClearOnboardingProgress).toHaveBeenCalledTimes(1);
  });

  it("submits only once even if it re-renders while sitting on the summary step", async () => {
    mockSaveOnboardingProfile.mockResolvedValue({ ok: true, profile: {} as OnboardingProfile });
    const { result } = await renderHook(() => useOnboardingFlow());
    await act(async () => {});
    await advance(result, SUMMARY_STEP);

    await act(async () => {
      result.current.back();
    });
    await act(async () => {
      result.current.next();
    });

    expect(mockSaveOnboardingProfile).toHaveBeenCalledTimes(1);
  });

  it("does not submit when there is no access token, and does not surface an error either", async () => {
    mockUseSession.mockReturnValue({
      status: "signedOut",
      accessToken: null,
      login: jest.fn(),
      logout: jest.fn(),
    });
    const { result } = await renderHook(() => useOnboardingFlow());
    await act(async () => {});

    await advance(result, SUMMARY_STEP);

    expect(mockSaveOnboardingProfile).not.toHaveBeenCalled();
    expect(result.current.submitError).toBeUndefined();
  });

  it("treats already_completed as a silent success (clears progress, no error)", async () => {
    mockSaveOnboardingProfile.mockResolvedValue({
      ok: false,
      error: { kind: "already_completed", message: "Onboarding is already complete." },
    });
    const { result } = await renderHook(() => useOnboardingFlow());
    await act(async () => {});

    await advance(result, SUMMARY_STEP);
    await act(async () => {});

    expect(mockClearOnboardingProgress).toHaveBeenCalledTimes(1);
    expect(result.current.submitError).toBeUndefined();
  });

  it("surfaces a non-network submission error without blocking navigation", async () => {
    mockSaveOnboardingProfile.mockResolvedValue({
      ok: false,
      error: { kind: "server", message: "Something went wrong on our end. Please try again." },
    });
    const { result } = await renderHook(() => useOnboardingFlow());
    await act(async () => {});

    await advance(result, SUMMARY_STEP);
    await act(async () => {});

    expect(result.current.submitError).toBe("Something went wrong on our end. Please try again.");
  });

  it("does not surface a network submission error (transient, not the learner's fault)", async () => {
    mockSaveOnboardingProfile.mockResolvedValue({
      ok: false,
      error: { kind: "network", message: "Couldn't reach the server. Check your connection and try again." },
    });
    const { result } = await renderHook(() => useOnboardingFlow());
    await act(async () => {});

    await advance(result, SUMMARY_STEP);
    await act(async () => {});

    expect(result.current.submitError).toBeUndefined();
  });
});
