import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRESS_KEY = "yu_onboarding_progress";

/** `selections[stepIndex]` is the list of option ids chosen on that step — same shape
 * `components/OnboardingFlow.tsx` already keeps in state, just mirrored to disk. */
export type StoredOnboardingProgress = {
  stepIndex: number;
  selections: Record<number, string[]>;
};

function isStoredOnboardingProgress(value: unknown): value is StoredOnboardingProgress {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredOnboardingProgress>;
  return typeof candidate.stepIndex === "number" && !!candidate.selections && typeof candidate.selections === "object";
}

/** Persists in-progress onboarding answers to on-device storage so a learner doesn't lose
 * their answers if the app is closed partway through the flow (see
 * lib/hooks/useOnboardingFlow.ts). Local only — nothing here is sent to the backend until the
 * flow reaches its final step (see lib/api/onboarding.ts). Uses AsyncStorage, same tradeoff as
 * lib/auth/tokenStorage.ts. */
export async function saveOnboardingProgress(progress: StoredOnboardingProgress): Promise<void> {
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

/** Returns the stored progress, or null if there is none or it's unreadable (corrupt JSON, or
 * an older/incompatible shape) — treated the same as "no saved progress" rather than throwing. */
export async function loadOnboardingProgress(): Promise<StoredOnboardingProgress | null> {
  const raw = await AsyncStorage.getItem(PROGRESS_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return isStoredOnboardingProgress(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function clearOnboardingProgress(): Promise<void> {
  await AsyncStorage.removeItem(PROGRESS_KEY);
}
