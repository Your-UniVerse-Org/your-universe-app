import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "@/components/SessionContext";
import { saveOnboardingProfile } from "@/lib/api/onboarding";
import type { CareerInterest, Grade, OnboardingProfileInput, Pathway } from "@/lib/api/types";
import { ONBOARDING_STEPS, type OnboardingStep } from "@/lib/onboarding-steps";
import { clearOnboardingProgress, loadOnboardingProgress, saveOnboardingProgress } from "@/lib/onboarding/storage";

function stepIndexOf(kind: OnboardingStep["kind"]): number {
  return ONBOARDING_STEPS.findIndex((step) => step.kind === kind);
}

const GRADE_STEP = stepIndexOf("grade");
const STRENGTHS_STEP = stepIndexOf("strengths");
const PRIORITIES_STEP = stepIndexOf("priorities");
const CAREERS_STEP = stepIndexOf("careers");
const PATHWAY_STEP = stepIndexOf("pathway");

/** Maps the flow's per-step selection state onto the shape PUT /learners/me/onboarding
 * expects, omitting any step the learner hasn't answered — an omitted key (not `undefined`
 * explicitly, since JSON.stringify drops those) is read by the backend as "leave this field
 * alone" (see OnboardingService.upsert in your-universe-backend), not as "clear it". */
function buildOnboardingPayload(selections: Record<number, string[]>): OnboardingProfileInput {
  const payload: OnboardingProfileInput = {};
  const grade = selections[GRADE_STEP]?.[0];
  const careerInterest = selections[CAREERS_STEP]?.[0];
  const pathway = selections[PATHWAY_STEP]?.[0];
  const strengths = selections[STRENGTHS_STEP];
  const priorities = selections[PRIORITIES_STEP];

  if (grade) payload.grade = grade as Grade;
  if (strengths?.length) payload.strengths = strengths;
  if (priorities?.length) payload.priorities = priorities;
  if (careerInterest) payload.career_interest = careerInterest as CareerInterest;
  if (pathway) payload.pathway = pathway as Pathway;

  return payload;
}

/** Drives the onboarding carousel: step/selection state, resuming in-progress answers from
 * on-device storage, persisting them back on every change, and submitting the finished flow to
 * the backend once the learner reaches the summary step. Kept separate from
 * components/OnboardingFlow.tsx so it's testable without rendering any UI — mirrors
 * useLearnerLogin.ts/useLearnerRegistration.ts. */
export function useOnboardingFlow() {
  const router = useRouter();
  const { accessToken } = useSession();
  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<number, string[]>>({});
  const [hydrated, setHydrated] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  const submittedRef = useRef(false);

  // Resume any answers saved before the app was last closed mid-flow.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadOnboardingProgress().catch(() => null);
      if (!cancelled && stored) {
        setStepIndex(Math.min(stored.stepIndex, ONBOARDING_STEPS.length - 1));
        setSelections(stored.selections);
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist on every change, but not before hydration finishes — otherwise the initial empty
  // state would overwrite whatever was just loaded above.
  useEffect(() => {
    if (!hydrated) return;
    saveOnboardingProgress({ stepIndex, selections }).catch(() => {});
  }, [hydrated, stepIndex, selections]);

  // Submit once, the first time the flow reaches its summary step.
  useEffect(() => {
    if (!hydrated || submittedRef.current) return;
    if (ONBOARDING_STEPS[stepIndex]?.kind !== "summary") return;
    submittedRef.current = true;

    if (!accessToken) {
      // No session yet — e.g. the auto-login the app attempts right after registration
      // (see docs/onboarding.md) didn't succeed. The answers stay in local storage; there is
      // no background sync queue yet, so they're only sent the next time this flow runs with
      // a valid session.
      return;
    }

    saveOnboardingProfile(accessToken, buildOnboardingPayload(selections)).then((result) => {
      if (result.ok || result.error.kind === "already_completed") {
        // already_completed means the answers are already saved server-side (this flow
        // shouldn't normally be reachable once complete — see useOnboardingStatus.ts — but a
        // stale screen or a second device could still hit it) — nothing to retry, and not
        // something to alarm the learner about.
        clearOnboardingProgress().catch(() => {});
      } else if (result.error.kind !== "network") {
        // A validation/auth/server error won't resolve itself by retrying with the same data —
        // surface it, but don't block the learner from moving on to Home.
        setSubmitError(result.error.message);
      }
    });
  }, [hydrated, stepIndex, selections, accessToken]);

  const step = ONBOARDING_STEPS[stepIndex];
  const selected = selections[stepIndex] ?? [];

  const toggle = useCallback(
    (id: string, multi?: boolean) => {
      setSelections((prev) => {
        const current = prev[stepIndex] ?? [];
        if (multi) {
          const next = current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id];
          return { ...prev, [stepIndex]: next };
        }
        return { ...prev, [stepIndex]: [id] };
      });
    },
    [stepIndex],
  );

  const next = useCallback(() => {
    if (stepIndex < ONBOARDING_STEPS.length - 1) setStepIndex((s) => s + 1);
    else router.replace("/home");
  }, [stepIndex, router]);

  const skip = useCallback(() => {
    clearOnboardingProgress().catch(() => {});
    router.replace("/home");
  }, [router]);

  const back = useCallback(() => {
    if (stepIndex > 0) setStepIndex((s) => s - 1);
  }, [stepIndex]);

  return { step, stepIndex, selected, toggle, next, skip, back, submitError };
}
