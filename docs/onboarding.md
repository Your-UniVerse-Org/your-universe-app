# Onboarding: on-device progress, and saving it to the backend

After a learner registers, `app/(auth)/intro.tsx` (a short carousel) and then
`components/OnboardingFlow.tsx` (grade → strengths → priorities → careers → pathway → summary)
ask a few questions used later to guide the learner. This doc covers how those answers are kept
on the device while the learner is still answering, and how/when they're sent to
`your-universe-backend`. For the backend's storage of this data, see that repo's
`docs/onboarding.md`.

## Why this needs a session, and how it gets one

Saving these answers hits a learner-authenticated endpoint
(`PUT /learners/me/onboarding`), but `POST /learners` (registration) issues no tokens — a
learner isn't signed in yet immediately after signing up (see `docs/session.md` and
`your-universe-backend`'s `docs/learner-auth.md`). So `app/(auth)/signup.tsx` auto-logs the
learner in with the credentials they just submitted, right after a successful registration,
before routing to `/intro`:

```tsx
const handleSuccess = useCallback(
  async (learner: Learner, input: LearnerRegistrationInput) => {
    await login(learner.email, input.password);
    router.push("/intro");
  },
  [login, router],
);
```

This is best-effort: `login()` never throws, and its result isn't checked here. If it fails for
some reason, the onboarding screens still work fully — see "No session when the flow finishes"
below.

## Files

```
lib/api/types.ts              Grade, CareerInterest, Pathway, OnboardingProfileInput,
                                 OnboardingProfile — mirrors schemas/onboarding.py
lib/api/errors.ts              SaveOnboardingError/GetOnboardingError, parseSaveOnboardingError/
                                 parseGetOnboardingError
lib/api/onboarding.ts          saveOnboardingProfile()/getOnboardingProfile() — PUT/GET
                                 /learners/me/onboarding, never throw
lib/onboarding/storage.ts      saveOnboardingProgress/loadOnboardingProgress/clearOnboardingProgress
                                 — AsyncStorage wrapper, same pattern as lib/auth/tokenStorage.ts
lib/onboarding-steps.ts        ONBOARDING_STEPS + each step's option list (unchanged by this work)
lib/hooks/useOnboardingFlow.ts Step/selection state, resume-from-storage, persist-on-change,
                                 submit-on-reaching-summary — all the logic, no UI
lib/hooks/useOnboardingStatus.ts Has this learner already completed onboarding? (backend-checked)
components/OnboardingFlow.tsx  The screen — renders whatever the hook gives it
app/(auth)/onboarding.tsx      Redirects to /home instead of rendering OnboardingFlow if already complete
app/(tabs)/home.tsx            Hides the "Complete your academic profile" prompt once already complete
app/(auth)/signup.tsx          Auto-login on registration success (see above)
```

`useOnboardingFlow` is deliberately UI-free, same reasoning as `useLearnerRegistration`/
`useLearnerLogin`: testable via `renderHook` without rendering the heavy carousel chrome.

## On-device storage: why, and what's stored

`lib/onboarding/storage.ts` persists `{ stepIndex, selections }` to `AsyncStorage` (key
`yu_onboarding_progress`) after every change, so a learner who closes the app partway through
onboarding resumes exactly where they left off next time `OnboardingFlow` mounts, instead of
starting over. `selections` mirrors the shape the carousel already kept in React state before
this change — `Record<stepIndex, optionId[]>` — just written to disk as well.

This is local-only: nothing here reaches the backend until the flow completes (see below). It's
cleared (`clearOnboardingProgress()`) once the final save succeeds, or the learner taps "Skip For
Now" on the intro step.

## Submitting to the backend

`useOnboardingFlow` submits once — the first time the flow's step reaches `"summary"` (i.e. right
after the "Continue" button on the pathway step) — via an effect guarded by a ref so it can't
double-fire on a re-render:

```ts
useEffect(() => {
  if (!hydrated || submittedRef.current) return;
  if (ONBOARDING_STEPS[stepIndex]?.kind !== "summary") return;
  submittedRef.current = true;
  // ...
}, [hydrated, stepIndex, selections, accessToken]);
```

The per-step `selections` are mapped onto the backend's field names by `buildOnboardingPayload`
(`lib/hooks/useOnboardingFlow.ts`), omitting any step the learner never answered — an omitted
key (not an explicit `undefined`/`null`) tells the backend "leave this field alone" rather than
"clear it" (see `OnboardingService.upsert` in `your-universe-backend`). This is a single
end-of-flow call today, but the backend endpoint is safe to call more than once with partial
data, so a future version of this hook could call it after every step instead without any
backend change.

### No session when the flow finishes

If `accessToken` is still `null` when the summary step is reached (the auto-login above didn't
succeed), the submit is skipped entirely — the answers stay in `AsyncStorage` and nothing is
sent. There is no background sync queue yet: the next thing that would send them is running this
same flow again with a valid session, which currently only happens once, right after
registration. Treated as an acceptable, documented gap rather than silently failing, since the
common case (auto-login succeeds) is the only one that matters today.

### Errors

A `network` error (the request never reached the backend) is treated as transient and not shown
— retrying isn't currently automatic, so surfacing it wouldn't give the learner anything
actionable, and it doesn't block navigating to Home either way. An `already_completed` error
(see below) is also not shown — it isn't a failure. Any other error (`401` unauthorized, `422`
validation, `5xx` server) sets `submitError`, which `components/OnboardingFlow.tsx` renders via
the existing `FormError` component on the summary screen — informational only; it does not
block the "Go to Home" button.

## Not letting a learner redo onboarding

Onboarding is meant to run once per learner. Two things enforce that, at different layers:

1. **The backend won't allow it.** Once a profile's `completed_at` is set,
   `PUT /learners/me/onboarding` rejects any further write with `409` (see
   `your-universe-backend`'s `docs/onboarding.md`) — a repeat submission wouldn't just be
   redundant, it would silently mutate a per-learner snapshot a data-engineering process may
   already be treating as fixed.
2. **The app doesn't offer the flow again once it knows the learner is done.**
   `lib/hooks/useOnboardingStatus.ts` asks the backend (`GET /learners/me/onboarding`) whether
   the calling learner's `completed_at` is set:
   - `app/(tabs)/home.tsx` hides the "Complete your academic profile" `NextBestAction` prompt
     once status is `"complete"` — the prompt that used to always link to `/onboarding`
     regardless of whether the learner had already finished it.
   - `app/(auth)/onboarding.tsx` redirects straight to `/home` instead of rendering
     `OnboardingFlow` at all if status is `"complete"` — covers direct navigation to the route
     (a stale bookmark, a deep link) even if the Home prompt above is somehow still showing.

This check is a live backend call (`useOnboardingStatus`), not a local flag, since "already
completed" is a server-side fact a learner could otherwise reach from a second device or after
reinstalling the app — an on-device flag alone can't know that.

If `useOnboardingFlow`'s own final save (see above) ever does still reach a completed profile —
the checks above should make this unreachable in normal use, but a stale screen or a second
device racing the first could still hit it — the `already_completed` response from
`saveOnboardingProfile` is treated the same as a success: local progress is cleared and nothing
is shown to the learner, since the answers are already saved either way.

## Tests

| File | Covers |
|---|---|
| `__tests__/lib/api/onboarding.test.ts` | `saveOnboardingProfile()`/`getOnboardingProfile()` against a mocked `fetch` — URL/method/headers (including the bearer token)/body, ok, 401/409/422/5xx, a 404 on GET mapping to `profile: null` (not an error), network throw, non-JSON body |
| `__tests__/lib/onboarding/storage.test.ts` | `saveOnboardingProgress`/`loadOnboardingProgress`/`clearOnboardingProgress` against a mocked `AsyncStorage` — correct key, null on missing/corrupt/wrong-shaped data |
| `__tests__/lib/hooks/useOnboardingStatus.test.ts` | Every status transition — loading while the session resolves, `"unknown"` without a session or on a failed request, `"complete"`/`"incomplete"` from the backend's `completed_at`, `"incomplete"` on a 404 (no profile yet) |
| `__tests__/lib/hooks/useOnboardingFlow.test.ts` | Resuming stored progress, persisting on every change, single/multi-select `toggle`, `back`/`skip`/`next` (including the final-step → Home case), submitting exactly once on reaching summary with the right payload, no submission (and no error) without a session, that `already_completed` is treated as a silent success, and that a non-network submission error surfaces while a network one doesn't |

Run with `npm test`. `useOnboardingFlow.test.ts` mocks `expo-router`'s `useRouter` with an
explicit factory (`jest.mock("expo-router", () => ({ useRouter: jest.fn() }))`) rather than a
bare `jest.mock("expo-router")` — the library's real module has enough surface area that a full
automock risks importing native-dependent code Jest can't run, whereas a bare automock is safe
for the app's own small modules (`@/components/SessionContext`, `@/lib/api/onboarding`,
`@/lib/onboarding/storage`).
