import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TokenPair } from "@/lib/api/types";
import { clearTokens, loadStoredTokens, saveTokens } from "@/lib/auth/tokenStorage";

jest.mock("@react-native-async-storage/async-storage", () => ({
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

const mockMultiGet = AsyncStorage.multiGet as jest.MockedFunction<typeof AsyncStorage.multiGet>;
const mockMultiSet = AsyncStorage.multiSet as jest.MockedFunction<typeof AsyncStorage.multiSet>;
const mockMultiRemove = AsyncStorage.multiRemove as jest.MockedFunction<typeof AsyncStorage.multiRemove>;

const TOKENS: TokenPair = {
  access_token: "access.jwt.token",
  refresh_token: "refresh.jwt.token",
  token_type: "bearer",
  expires_in: 900,
};

afterEach(() => {
  mockMultiGet.mockReset();
  mockMultiSet.mockReset();
  mockMultiRemove.mockReset();
});

describe("saveTokens", () => {
  it("writes both tokens under their storage keys", async () => {
    mockMultiSet.mockResolvedValue(undefined);

    await saveTokens(TOKENS);

    expect(mockMultiSet).toHaveBeenCalledWith([
      ["yu_learner_access_token", TOKENS.access_token],
      ["yu_learner_refresh_token", TOKENS.refresh_token],
    ]);
  });
});

describe("loadStoredTokens", () => {
  it("returns both tokens when both are present", async () => {
    mockMultiGet.mockResolvedValue([
      ["yu_learner_access_token", TOKENS.access_token],
      ["yu_learner_refresh_token", TOKENS.refresh_token],
    ]);

    const result = await loadStoredTokens();

    expect(result).toEqual({ accessToken: TOKENS.access_token, refreshToken: TOKENS.refresh_token });
  });

  it("returns null when nothing is stored", async () => {
    mockMultiGet.mockResolvedValue([
      ["yu_learner_access_token", null],
      ["yu_learner_refresh_token", null],
    ]);

    expect(await loadStoredTokens()).toBeNull();
  });

  it("returns null when only one half of the pair is present", async () => {
    mockMultiGet.mockResolvedValue([
      ["yu_learner_access_token", TOKENS.access_token],
      ["yu_learner_refresh_token", null],
    ]);

    expect(await loadStoredTokens()).toBeNull();
  });
});

describe("clearTokens", () => {
  it("removes both storage keys", async () => {
    mockMultiRemove.mockResolvedValue(undefined);

    await clearTokens();

    expect(mockMultiRemove).toHaveBeenCalledWith(["yu_learner_access_token", "yu_learner_refresh_token"]);
  });
});
