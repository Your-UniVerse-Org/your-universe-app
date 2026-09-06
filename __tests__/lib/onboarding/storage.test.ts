import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  clearOnboardingProgress,
  loadOnboardingProgress,
  saveOnboardingProgress,
  type StoredOnboardingProgress,
} from "@/lib/onboarding/storage";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockGetItem = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
const mockSetItem = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;
const mockRemoveItem = AsyncStorage.removeItem as jest.MockedFunction<typeof AsyncStorage.removeItem>;

const PROGRESS: StoredOnboardingProgress = {
  stepIndex: 2,
  selections: { 1: ["10"], 2: ["Creativity", "Teamwork"] },
};

afterEach(() => {
  mockGetItem.mockReset();
  mockSetItem.mockReset();
  mockRemoveItem.mockReset();
});

describe("saveOnboardingProgress", () => {
  it("writes the progress as JSON under the storage key", async () => {
    mockSetItem.mockResolvedValue(undefined);

    await saveOnboardingProgress(PROGRESS);

    expect(mockSetItem).toHaveBeenCalledWith("yu_onboarding_progress", JSON.stringify(PROGRESS));
  });
});

describe("loadOnboardingProgress", () => {
  it("returns the stored progress when present", async () => {
    mockGetItem.mockResolvedValue(JSON.stringify(PROGRESS));

    expect(await loadOnboardingProgress()).toEqual(PROGRESS);
  });

  it("returns null when nothing is stored", async () => {
    mockGetItem.mockResolvedValue(null);

    expect(await loadOnboardingProgress()).toBeNull();
  });

  it("returns null for corrupt JSON rather than throwing", async () => {
    mockGetItem.mockResolvedValue("{not-valid-json");

    expect(await loadOnboardingProgress()).toBeNull();
  });

  it("returns null for a value missing the expected shape", async () => {
    mockGetItem.mockResolvedValue(JSON.stringify({ somethingElse: true }));

    expect(await loadOnboardingProgress()).toBeNull();
  });
});

describe("clearOnboardingProgress", () => {
  it("removes the storage key", async () => {
    mockRemoveItem.mockResolvedValue(undefined);

    await clearOnboardingProgress();

    expect(mockRemoveItem).toHaveBeenCalledWith("yu_onboarding_progress");
  });
});
