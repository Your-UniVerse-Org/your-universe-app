import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TokenPair } from "@/lib/api/types";

const ACCESS_TOKEN_KEY = "yu_learner_access_token";
const REFRESH_TOKEN_KEY = "yu_learner_refresh_token";

export type StoredTokens = { accessToken: string; refreshToken: string };

/** Persists a learner's token pair to on-device storage so the session survives an app
 * restart — see docs/session.md for how components/SessionContext.tsx uses this on launch.
 * Uses AsyncStorage (unencrypted, sandboxed per-app but not per-OS-keychain); see
 * docs/session.md for the tradeoff and the upgrade path to expo-secure-store. */
export async function saveTokens(tokens: TokenPair): Promise<void> {
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, tokens.access_token],
    [REFRESH_TOKEN_KEY, tokens.refresh_token],
  ]);
}

/** Returns the stored token pair, or null if either half is missing (never partially — a
 * session is only ever "both present" or "signed out"). */
export async function loadStoredTokens(): Promise<StoredTokens | null> {
  const entries = await AsyncStorage.multiGet([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  const accessToken = entries.find(([key]) => key === ACCESS_TOKEN_KEY)?.[1];
  const refreshToken = entries.find(([key]) => key === REFRESH_TOKEN_KEY)?.[1];
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export async function clearTokens(): Promise<void> {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
}
