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
| `api/errors.test.ts` | 422 field/cross-field/string/malformed, 409, 5xx → typed errors |
| `api/learners.test.ts` | Mocked `fetch`: URL/method/headers/body, ok + all error paths + throw + non-JSON |
| `api/config.test.ts` | Env read/trim/trailing-slash/throw-when-unset |
| `hooks/useLearnerRegistration.test.ts` | `renderHook`: gating, mocked API, error mapping, `onSuccess`, edit-clears-error |

## Gotchas (will silently break suites)

- `renderHook` is **async** in v14: `await renderHook(...)`, not destructure directly.
- `act()` returns a thenable even for sync callbacks — **await** it, else “overlapping act()” and unset `result`.
- Never global `jest.resetAllMocks()` in `afterEach` — wipes `jest-expo` native mocks; reset only your own (`myMock.mockReset()`).

## Adding tests

New `lib/` module → mirror path under `__tests__/lib/`, mock `fetch` per `learners.test.ts` pattern, keep hook tests UI-free. Manual checklist for UI changes still required in PR.
