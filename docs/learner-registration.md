# Learner registration

The "Sign up" screen (`app/(auth)/signup.tsx`) registers a new learner against
`your-universe-backend`'s `POST /learners` endpoint (see that repo's `docs/learners.md` for the
full API contract). This page covers how the pieces fit together and how errors are handled.

## Configuration

The backend's base URL is **not** hardcoded — it comes from `EXPO_PUBLIC_API_BASE_URL`, read in
`lib/api/config.ts`. Copy `.env.example` to `.env.local` and set it for your setup:

- iOS Simulator / web: `http://127.0.0.1:8000`
- Android Emulator: `http://10.0.2.2:8000` (`127.0.0.1` on Android means the emulator itself,
  not your machine)
- Expo Go on a physical device: `http://<your-machine's-LAN-IP>:8000`

If unset, it falls back to `http://127.0.0.1:8000`.

## Layers

```
lib/api/types.ts                 Gender, LearnerRegistrationInput, Learner — mirrors the backend schema
lib/validation/learner.ts        Client-side validation mirroring schemas/learner.py, for instant feedback
lib/api/errors.ts                Parses FastAPI's 422/409/5xx response shapes into a typed error
lib/api/learners.ts              registerLearner() — the actual fetch() call, never throws
lib/hooks/useLearnerRegistration.ts   Form state + validate-then-submit + error mapping, no UI
app/(auth)/signup.tsx            The screen — renders fields/errors, wired to the hook above
```

The hook is deliberately UI-free so it's testable without rendering the screen (heavy chrome:
`GalacticBackground`, fonts, SVG). The screen itself stays thin — it just renders whatever the
hook gives it.

## Error handling

`registerLearner()` never throws; every outcome comes back as a typed result:

| Backend response | `RegisterLearnerError.kind` | Shown as |
|---|---|---|
| `422` (Pydantic validation) | `"validation"` | Per-field error text under the relevant `AuthField`/`SegmentedField`. A cross-field error (e.g. "email and guardian_email must be different", which Pydantic reports with no specific field) becomes a form-level banner instead. |
| `409` (duplicate email) | `"conflict"` | Form-level banner (`FormError`) |
| Any other non-2xx | `"server"` | Form-level banner, generic message if the backend didn't send a useful `detail` |
| `fetch()` itself throws (offline, DNS failure, backend not running) | `"network"` | Form-level banner |

Client-side validation (`lib/validation/learner.ts`) runs first and blocks the API call entirely
if the form is obviously invalid — but it's a UX convenience only, deliberately kept as a loose
mirror of the backend's rules. The backend's own validation errors always still get shown (e.g.
if the two drift out of sync, or the backend adds a rule the client doesn't know about), rather
than assuming client-side validation passing means the request will succeed.

Submitting a valid form disables the "Register" button and shows a spinner (`PrimaryButton`'s
`loading` prop) until the request resolves. On success, `app/(auth)/signup.tsx`'s `onSuccess`
callback also signs the learner in (`useSession().login(learner.email, input.password)`) before
navigating to `/intro` — registration itself issues no tokens, but the onboarding carousel that
follows needs a session to save its answers. See `docs/onboarding.md` for that flow, and
`your-universe-backend`'s `docs/learner-auth.md` for why registration and login are separate
calls.

## Gender field

The backend's `gender` column is a closed set (`male` / `female` / `other` /
`prefer_not_to_say`). Rather than a free-text field that would need normalizing to match, the
signup screen uses a new `SegmentedField` component (`components/ui.tsx`) — a row of selectable
pills sourced from `GENDER_OPTIONS` in `lib/api/types.ts`, so the value sent to the API is always
exactly one of the values the backend accepts.

## Tests

Everything under `lib/` for this feature has unit tests in `__tests__/lib/`, mirroring the
source tree:

| Test file | Covers |
|---|---|
| `__tests__/lib/validation/learner.test.ts` | Every client-side validator, plus the full-form aggregator (including the cross-field email/guardian_email rule) |
| `__tests__/lib/api/errors.test.ts` | Parsing FastAPI's actual 422/409/5xx response shapes (field errors, cross-field/form errors, malformed bodies) into `RegisterLearnerError` |
| `__tests__/lib/api/learners.test.ts` | `registerLearner()` against a mocked `fetch` — request shape (URL/method/headers/body) and every response/error path, including `fetch` throwing and a non-JSON error body |
| `__tests__/lib/hooks/useLearnerRegistration.test.ts` | The form hook via `@testing-library/react-native`'s `renderHook` — validation gating, calling the (mocked) API, mapping every error kind, `onSuccess`, and that editing a field clears its error |

Run with `npm test` (or `npm run test:watch`). This was the first test suite in the app, so it
also set up the Jest/Testing Library infrastructure itself (`package.json`'s `jest` key using the
`jest-expo` preset, `tsconfig.json`'s `types: ["jest"]`).

### Two Jest/Testing-Library gotchas hit while writing these

Both would silently break every test after the first, or every test using a particular helper,
without an obviously-related error message — worth knowing if this pattern gets copied elsewhere:

- **`renderHook` is `async` in `@testing-library/react-native` v14.** `const { result } = renderHook(...)` silently destructures `result` off a `Promise`, giving `undefined`. Must be
  `await renderHook(...)`.
- **`act()` returns a thenable even for a synchronous callback** and must be awaited, or a
  following `act()`/`renderHook()` call in the same test can start before the previous one's
  scope has closed ("overlapping act() calls", and `result` ends up unset).
- **Don't call `jest.resetAllMocks()` in a shared `afterEach`.** It also resets `jest-expo`'s
  internal native-module mocks that `renderHook`/`act` themselves depend on, breaking every test
  that runs after the first `afterEach`. Reset only your own mocks
  (`myMock.mockReset()`), not everything.
