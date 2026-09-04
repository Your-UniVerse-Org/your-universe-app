# Session: learner login, token persistence, and route guarding

Covers how a learner signs in, how the app keeps them signed in across restarts without a
Supabase-style auth account, and where the guardrails live that stop an unauthenticated visitor
from reaching the app's protected screens. For the backend side (JWT issuance, access/refresh
token design) see `docs/learner-auth.md` in `your-universe-backend`.

## Why learners are different from guardians here

Guardians authenticate against **Supabase Auth** directly from the client (per the backend's own
`docs/learner-auth.md`) — not integrated into this app yet. Learners authenticate with a
password `your-universe-backend` owns and issues its own JWTs for
(`POST /learners/login`, `POST /auth/refresh`). That's why there are two login screens:

| Screen | Route | Wired? |
|---|---|---|
| Learner sign-in | `/login` | Yes — hits `POST /learners/login` |
| Guardian sign-in | `/guardian-login` | No — shows a "coming soon" message; will call Supabase Auth in a later phase |

Each screen links to the other ("Signing in as a guardian?" / "Signing in as a learner?").

## Files

```
lib/api/types.ts            LearnerLoginInput, TokenPair (mirrors schemas/auth.py)
lib/api/errors.ts           LoginError, RefreshError, parseLoginError, parseRefreshError,
                               shared NetworkError + parseLocFieldValidation helper
lib/api/auth.ts             loginLearner(), refreshLearnerToken() — never throw, POST
                               /learners/login and /auth/refresh respectively
lib/validation/auth.ts      validateLoginForm — email format + non-empty password only
                               (NOT registration's complexity rule — see below)
lib/auth/tokenStorage.ts    saveTokens/loadStoredTokens/clearTokens — AsyncStorage wrapper
lib/auth/featureFlags.ts    OAUTH_LOGIN_ENABLED — see "OAuth" below
lib/hooks/useLearnerLogin.ts  Form state + validate + call session.login() + map errors,
                               mirrors lib/hooks/useLearnerRegistration.ts
components/SessionContext.tsx SessionProvider/useSession — the only thing that touches token
                               storage or calls login/refresh; everything else goes through it
app/(auth)/login.tsx        Learner sign-in screen
app/(auth)/guardian-login.tsx Guardian sign-in screen (stub)
app/index.tsx                Redirects to /home or /welcome based on session status
app/(tabs)/_layout.tsx       Redirects to /welcome if not signed in (route guard)
app/(tabs)/profile.tsx       Sign-out button calls session.logout()
```

## Why login validation differs from registration's

`lib/validation/learner.ts::validatePassword` enforces the *registration* complexity rule
(8–72 chars, letter + digit) — appropriate when someone is **choosing** a new password.
`lib/validation/auth.ts::validateLoginPassword` only checks the password isn't empty: rejecting
an existing, already-registered password client-side for "not being complex enough" would be
wrong (and confusing) at login time. The backend is authoritative either way — a password that
somehow fails there still surfaces via `parseLoginError`'s `validation` branch.

## Login flow

1. `app/(auth)/login.tsx` renders `AuthField`s bound to `useLearnerLogin()`'s `values`/`setField`.
2. On submit, the hook client-validates (`validateLoginForm`) — blocks the call and shows field
   errors if invalid, same pattern as `useLearnerRegistration`.
3. If valid, it calls `useSession().login(email, password)`, which calls
   `loginLearner()` (→ `POST /learners/login`) and, on success, persists the returned
   `{access_token, refresh_token}` via `saveTokens()` and flips `status` to `"signedIn"`.
4. The screen's `onSuccess` callback (`router.replace("/home")`) fires — `replace`, not `push`,
   so the back button can't return to the login screen once signed in.

A `401` from the backend means "email or password is wrong" — and, deliberately, the backend
returns the **same message** whether the email doesn't exist or the password is wrong (see
`services/learner_service.py::authenticate` in `your-universe-backend`), so this app can't and
doesn't try to tell those two cases apart either (`parseLoginError`, tested in
`__tests__/lib/api/auth.test.ts`).

## Staying signed in across app restarts

`SessionProvider` (wraps the whole app in `app/_layout.tsx`, alongside `ThemeProvider`) runs
this once on mount:

1. Read `{accessToken, refreshToken}` from `AsyncStorage` (`tokenStorage.ts`). Nothing stored →
   `status = "signedOut"`, done.
2. If both are present, **always call `POST /auth/refresh`** with the stored refresh token —
   never trust the stored access token directly, since it's short-lived
   (`LEARNER_JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15` on the backend) and is very likely already
   expired by the time the app is reopened.
3. Refresh succeeds → persist the new token pair, `status = "signedIn"`. This is what "stay
   logged in" actually means here: signed in for as long as the *refresh* token remains valid
   (7 days by default — `LEARNER_JWT_REFRESH_TOKEN_EXPIRE_DAYS` on the backend), re-validated
   every time the app launches.
4. Refresh fails (expired, revoked-by-deletion, network reachable but rejected) → clear storage,
   `status = "signedOut"`. The learner sees the normal welcome/login flow again.

`status` starts as `"loading"` until step 2/3/4 resolves. Both `app/index.tsx` and
`app/(tabs)/_layout.tsx` treat `"loading"` as "don't decide yet" (render nothing) rather than
guessing — a real network round trip is in flight, and guessing wrong in either direction is a
worse experience than one blank frame (in the common case this resolves before the fixed splash
screen `LoadingScreen` finishes, so nothing is even visible).

## Route guarding

Direct navigation to a tab route (e.g. typing `/home`) without a valid session redirects to
`/welcome` instead of rendering — enforced once, in `app/(tabs)/_layout.tsx`, rather than
per-screen, since every tab route lives under that one layout:

```tsx
if (status === "loading") return null;
if (status === "signedOut") return <Redirect href="/welcome" />;
```

`app/index.tsx` (the `/` route) does the launch-time equivalent: signed-in learners skip
`/welcome`/`/login` entirely and land on `/home` directly.

## Sign out

`app/(tabs)/profile.tsx`'s sign-out button calls `session.logout()` (clears stored tokens,
`status = "signedOut"`) before `router.replace("/welcome")`. This is **local-only** — the
backend has no revocation store yet (`your-universe-backend`'s `docs/learner-auth.md`, "Scaling"
section), so the refresh token isn't invalidated server-side, only forgotten on this device. Not
a practical issue today since nothing else holds a copy of it.

## Known limitations / future work

- **`AsyncStorage` is unencrypted.** It's sandboxed per-app (another app can't read it) but not
  protected by the OS keychain/keystore the way `expo-secure-store` is. Acceptable for now since
  registration itself already stores a bcrypt-hashed password server-side and nothing more
  sensitive than a JWT touches this device — but if that risk profile changes, swap
  `lib/auth/tokenStorage.ts`'s `AsyncStorage` calls for `expo-secure-store`'s
  `getItemAsync`/`setItemAsync`/`deleteItemAsync` (a new native dependency; needs a
  prebuild/rebuild, not just a JS change).
- **No authenticated-request helper yet.** `SessionContext` exposes `accessToken`, but no screen
  currently calls a protected backend endpoint (`GET /learners/me` included) — every tab
  (`home`/`explore`/`portfolio`/`profile`) is still static mock data (see
  `docs/domain-logic.md`). When a screen needs one, add a small `fetchWithAuth` wrapper that
  attaches `Authorization: Bearer <accessToken>` and retries once via `session` after a `401` —
  don't scatter manual header-setting across screens.
- **No mid-session revocation.** See "Sign out" above.

## OAuth (Google Sign-In)

Built but disabled: `lib/auth/featureFlags.ts::OAUTH_LOGIN_ENABLED = false`. Both login screens
already gate their `<GoogleSignInButton>` behind this flag, so re-enabling it later (once an
actual OAuth flow is implemented) should just mean flipping the flag — no screen changes
expected. Until then, email/password is the only supported login method on both screens.

## Tests

| File | Covers |
|---|---|
| `__tests__/lib/api/auth.test.ts` | `loginLearner`/`refreshLearnerToken` — URL/method/body, ok, 401 (incl. identical error for unknown-email vs wrong-password), 422, 5xx, network throw, non-JSON body |
| `__tests__/lib/validation/auth.test.ts` | `validateLoginForm`/`validateLoginPassword` — missing email/password, malformed email, and that an existing (non-"complex") password is still accepted |
| `__tests__/lib/auth/tokenStorage.test.ts` | `saveTokens`/`loadStoredTokens`/`clearTokens` against a mocked `AsyncStorage` — correct keys, null when only one half of the pair is present |
| `__tests__/lib/hooks/useLearnerLogin.test.ts` | Form gating, mocked `SessionContext.login`, error-kind mapping (`invalid_credentials`/`validation`/`network`/`server`), `onSuccess`, edit-clears-error |

`components/SessionContext.tsx` itself has no render/hook test — per `docs/testing.md`,
components aren't render-tested here (same as `ThemeContext.tsx`, which has none either); the
logic worth testing (storage, API calls, form handling) is factored into the `lib/` modules
above, which are.

**Global test setup:** any test that transitively imports `AsyncStorage` (even indirectly, via
an automock of `SessionContext`) needs a working mock or Jest crashes with `"NativeModule:
AsyncStorage is null"` — there's no native module to link under Jest. `__mocks__/@react-native-
async-storage/async-storage.js` re-exports the package's own official in-memory mock; being
under a root-level `__mocks__/` (adjacent to `node_modules`, not under `__tests__/`) makes Jest
apply it to every test automatically, with no `jest.mock()` call needed per file. `tokenStorage
.test.ts` still defines its own explicit mock (finer-grained call assertions) — an explicit
`jest.mock()` in a test file always wins over the automatic one.
