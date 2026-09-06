import { useEffect, useState } from "react";
import { useSession } from "@/components/SessionContext";
import { getOnboardingProfile } from "@/lib/api/onboarding";

export type OnboardingStatus = "loading" | "unknown" | "incomplete" | "complete";

/** Whether the signed-in learner has already finished the onboarding flow
 * (components/OnboardingFlow.tsx) — checked against the backend rather than any on-device
 * flag, since "complete" is a server-side fact (see docs/onboarding.md) a learner could
 * otherwise reach on a second device or after reinstalling the app.
 *
 * - `"loading"` — still resolving the session or the request is in flight; callers should
 *   render nothing/neutral rather than guess (same convention as SessionContext's `"loading"`).
 * - `"unknown"` — no session, or the request failed; callers fall back to treating this like
 *   `"incomplete"` (safer to over-prompt than to hide a real next step).
 * - `"incomplete"` / `"complete"` — the backend's actual answer. */
export function useOnboardingStatus(): OnboardingStatus {
  const { status: sessionStatus, accessToken } = useSession();
  const [status, setStatus] = useState<OnboardingStatus>("loading");

  useEffect(() => {
    if (sessionStatus === "loading") return;

    if (!accessToken) {
      setStatus("unknown");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    getOnboardingProfile(accessToken).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setStatus("unknown");
        return;
      }
      setStatus(result.profile?.completed_at ? "complete" : "incomplete");
    });

    return () => {
      cancelled = true;
    };
  }, [sessionStatus, accessToken]);

  return status;
}
