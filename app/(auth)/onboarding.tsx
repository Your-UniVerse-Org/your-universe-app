import { Redirect } from "expo-router";
import OnboardingFlow from "@/components/OnboardingFlow";
import { useOnboardingStatus } from "@/lib/hooks/useOnboardingStatus";

export default function OnboardingScreen() {
  const status = useOnboardingStatus();

  // A learner who already finished onboarding (on this device or another) must not be able to
  // redo it — the backend rejects the write anyway (see docs/onboarding.md), but bouncing here
  // avoids showing the whole flow just to hit that error at the end.
  if (status === "loading") return null;
  if (status === "complete") return <Redirect href="/home" />;
  return <OnboardingFlow />;
}
