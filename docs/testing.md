# Testing

`jest-expo` preset + `@testing-library/react-native@^14` (hooks only). Screens/components have **no** render tests — verify UI manually; tests cover `lib/` logic.

## Run

```bash
npm test
npm run test:watch
```

Config: `package.json` → `jest{preset:jest-expo}`, `tsconfig types:["jest"]`.

## Layout (`__tests__/lib/` mirrors `lib/`)

| Test | Covers |
|---|---|
| `validation/learner.test.ts` | Each validator + `validateLearnerForm` incl. cross-field email rule |
| `validation/auth.test.ts` | `validateLoginForm`/`validateLoginPassword` — missing fields, malformed email, non-"complex" existing password still accepted |
| `api/errors.test.ts` | 422 field/cross-field/string/malformed, 409, 5xx → typed errors |
| `api/learners.test.ts` | Mocked `fetch`: URL/method/headers/body, ok + all error paths + throw + non-JSON |
| `api/auth.test.ts` | Mocked `fetch` for `loginLearner`/`refreshLearnerToken`: URL/method/body, ok, 401 (incl. identical error for unknown-email vs wrong-password), 422, 5xx, throw, non-JSON |
| `api/config.test.ts` | Env read/trim/trailing-slash/throw-when-unset |
| `auth/tokenStorage.test.ts` | `saveTokens`/`loadStoredTokens`/`clearTokens` against a mocked `AsyncStorage` — keys, null-when-partial |
| `hooks/useLearnerRegistration.test.ts` | `renderHook`: gating, mocked API, error mapping, `onSuccess`, edit-clears-error |
| `hooks/useLearnerLogin.test.ts` | Same shape, mocking `components/SessionContext`'s `useSession` instead of an API module directly (see [session](session.md)) |

`components/SessionContext.tsx` has no test of its own — components aren't render-tested here
(see "What's not tested" below); its logic lives in the `lib/` modules above instead.

## Gotchas (will silently break suites)

- `renderHook` is **async** in v14: `await renderHook(...)`, not destructure directly.
- `act()` returns a thenable even for sync callbacks — **await** it, else “overlapping act()” and unset `result`.
- Never global `jest.resetAllMocks()` in `afterEach` — wipes `jest-expo` native mocks; reset only your own (`myMock.mockReset()`).
- `jest.mock("@/components/SomeContext")` (bare automock, no factory) still `require()`s the real module once to learn its export shape — if that module transitively imports `@react-native-async-storage/async-storage`, the real native module gets pulled in too and Jest crashes with `NativeModule: AsyncStorage is null`. Fixed globally via `__mocks__/@react-native-async-storage/async-storage.js` (a root-level manual mock, applied automatically to every test — no per-file `jest.mock()` needed); don't delete that file.

## What's not tested

Screens/components have no render tests — verify UI manually (see the PR checklist in
[conventions](conventions.md)). This now includes `components/SessionContext.tsx`: its
launch-time bootstrap (read storage → call `/auth/refresh` → set status) is exercised
indirectly by testing `lib/auth/tokenStorage.ts` and `lib/api/auth.ts` separately, not by
rendering the provider.

## Adding tests

New `lib/` module → mirror path under `__tests__/lib/`, mock `fetch` per `learners.test.ts` pattern (or the dependency directly, per `hooks/useLearnerLogin.test.ts`'s `jest.mock` of `SessionContext`), keep hook tests UI-free. Manual checklist for UI changes still required in PR.
