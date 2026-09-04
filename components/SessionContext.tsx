import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { loginLearner, refreshLearnerToken } from "@/lib/api/auth";
import type { LoginError } from "@/lib/api/errors";
import { clearTokens, loadStoredTokens, saveTokens } from "@/lib/auth/tokenStorage";

export type SessionStatus = "loading" | "signedIn" | "signedOut";

export type LoginResult = { ok: true } | { ok: false; error: LoginError };

type SessionContextValue = {
  /** "loading" only while the launch-time refresh (see below) is in flight — every screen
   * that needs to gate on auth (app/index.tsx, app/(tabs)/_layout.tsx) should treat "loading"
   * as "don't decide yet", not as signed out. */
  status: SessionStatus;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = await loadStoredTokens().catch(() => null);
      if (!stored) {
        if (!cancelled) setStatus("signedOut");
        return;
      }

      // Always refresh on launch rather than trusting the stored access token (which is
      // short-lived and very likely already expired by the time the app is reopened): this
      // is what keeps a learner signed in only while their refresh token is still valid, and
      // guarantees a non-expired access token as soon as the app opens.
      const result = await refreshLearnerToken(stored.refreshToken);
      if (cancelled) return;

      if (result.ok) {
        await saveTokens(result.tokens).catch(() => {});
        setAccessToken(result.tokens.access_token);
        setStatus("signedIn");
      } else {
        await clearTokens().catch(() => {});
        setStatus("signedOut");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const result = await loginLearner({ email, password });
    if (!result.ok) return { ok: false, error: result.error };

    await saveTokens(result.tokens);
    setAccessToken(result.tokens.access_token);
    setStatus("signedIn");
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    // Local-only: the backend has no revocation store yet (see docs/learner-auth.md in
    // your-universe-backend), so this doesn't invalidate the refresh token server-side — it
    // just stops this device from using it. Fine for now since nothing else can see it.
    await clearTokens().catch(() => {});
    setAccessToken(null);
    setStatus("signedOut");
  }, []);

  const value = useMemo(() => ({ status, accessToken, login, logout }), [status, accessToken, login, logout]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
