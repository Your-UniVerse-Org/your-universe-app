# API client

Backend I/O in `lib/api/`. Integrated endpoints today: `POST /learners`, `POST /learners/login`,
`POST /auth/refresh`. For the full signup walkthrough see [learner-registration](learner-registration.md);
for login + session persistence see [session](session.md).

## Files

- `config.ts` → `getApiBaseUrl(): string` — reads `EXPO_PUBLIC_API_BASE_URL`, trims, strips trailing `/`, throws if unset. See [getting-started](getting-started.md) for per-platform values.
- `types.ts` — hand-mirror of backend `schemas/learner.py` + `schemas/auth.py`: `Gender`, `GENDER_OPTIONS`, `LearnerField` (8 fields), `LearnerRegistrationInput`, `Learner` (+ `id/created_at/updated_at`), `LearnerLoginInput` (`email`,`password`), `TokenPair` (`access_token`,`refresh_token`,`token_type`,`expires_in`).
- `learners.ts` → `registerLearner(input): Promise<RegisterLearnerResult>` — **never throws**. `POST {base}/learners` JSON, `Content-Type+Accept: application/json`. Non-JSON error bodies tolerated. Returns `{ok:true,learner}` or `{ok:false,error}`.
- `auth.ts` → `loginLearner(input): Promise<LoginLearnerResult>` (`POST {base}/learners/login`) and `refreshLearnerToken(refreshToken): Promise<RefreshTokenResult>` (`POST {base}/auth/refresh`, body `{refresh_token}`) — same never-throws shape. Both return `{ok:true,tokens}` or `{ok:false,error}`. Never call these directly from a screen or hook other than `components/SessionContext.tsx` — that's the one place a token pair gets persisted; see [session](session.md).
- `errors.ts` → `NetworkError = {kind:"network",message}` shared by every union below; `RegisterLearnerError = validation{fieldErrors,formError?} | conflict{message} | NetworkError | server{message}`; `LoginError = invalid_credentials{message} | validation{fieldErrors,formError?} | NetworkError | server{message}`; `RefreshError = invalid_token{message} | NetworkError | server{message}`. `parseRegisterLearnerError`/`parseLoginError`/`parseRefreshError` map `(status, body)` → the matching union; `networkError(msg?)`. The two 422-parsers (`parseValidationBody`, and login's inline call) both go through a shared `parseLocFieldValidation(body, isField)` helper that walks FastAPI's `detail[]` shape once, parameterized by which field names are recognized.

## Error mapping

| Status | Endpoint | Kind | UI |
|---|---|---|---|
| 422 | any | `validation` | FastAPI `detail[] {loc,msg}`: `loc=["body",field]` → `fieldErrors[field]` (first wins, strips `Value error,`), else → `formError`. String `detail` → `formError` |
| 409 | `/learners` | `conflict` | Banner, fallback “An account with these details already exists.” |
| 401 | `/learners/login` | `invalid_credentials` | Field-agnostic banner — same message for an unknown email as a wrong password (see [session](session.md)) |
| 401 | `/auth/refresh` | `invalid_token` | Not shown to the user directly — `SessionContext` treats this as "sign the learner out", see [session](session.md) |
| other non-2xx | any | `server` | Banner, fallback “Something went wrong…” |
| fetch throws | any | `network` | Banner “Couldn't reach the server…” |

## Hooks (`lib/hooks/`)

- `useLearnerRegistration.ts` → `useLearnerRegistration(onSuccess?) → {values,setField(field,value),fieldErrors,formError,submitting,handleSubmit():Promise<boolean>}` — client `validateLearnerForm` first (blocks call), then `registerLearner`, maps `validation→fields+banner`, others→banner. Editing a field clears its error + `formError`. UI-free for tests. Used only by `app/(auth)/signup.tsx` (success → `/intro`).
- `useLearnerLogin.ts` → same shape as above but backed by `validateLoginForm` + `useSession().login()` instead of `registerLearner` directly (login persists tokens as a side effect inside `SessionContext`, not in this hook). Used only by `app/(auth)/login.tsx` (success → `replace(/home)`). See [session](session.md).

## Validation (`lib/validation/`)

- `learner.ts` — pure functions + `validateLearnerForm` (incl. cross-field `email !== guardian_email`, case-insensitive). Rules: email regex + ≤320; phone strip spaces/dashes → `^\+?[1-9]\d{6,14}$`; DOB `YYYY-MM-DD`, not future, 3–100y; password 8–72 + letter+digit; name/school required ≤255.
- `auth.ts` — `validateLoginForm`: reuses `learner.ts`'s `validateEmail`, but `validateLoginPassword` only checks non-empty (login must accept an existing password as-is, not re-enforce registration's complexity rule — see [session](session.md)).

Backend authoritative either way — client validation is feedback only.

## Adding an endpoint

1. Types in `types.ts` → error kind in `errors.ts` → fetch fn in `learners.ts`/`auth.ts` (or new `lib/api/<res>.ts`) returning `Result`, never throw.
2. Hook in `lib/hooks/` for state, screen stays thin.
3. Tests mirroring in `__tests__/lib/` — see [testing](testing.md).
