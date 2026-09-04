# API client

Backend I/O in `lib/api/`. Only integrated endpoint today: `POST /learners`. For the full signup walkthrough see [learner-registration](learner-registration.md).

## Files

- `config.ts` → `getApiBaseUrl(): string` — reads `EXPO_PUBLIC_API_BASE_URL`, trims, strips trailing `/`, throws if unset. See [getting-started](getting-started.md) for per-platform values.
- `types.ts` — hand-mirror of backend `schemas/learner.py`: `Gender`, `GENDER_OPTIONS`, `LearnerField` (8 fields), `LearnerRegistrationInput` (gender `Gender|null`, `date_of_birth` `YYYY-MM-DD`), `Learner` (+ `id/created_at/updated_at`).
- `learners.ts` → `registerLearner(input): Promise<RegisterLearnerResult>` — **never throws**. `POST {base}/learners` JSON, `Content-Type+Accept: application/json`. Non-JSON error bodies tolerated. Returns `{ok:true,learner}` or `{ok:false,error}`.
- `errors.ts` → `RegisterLearnerError = validation{fieldErrors,formError?} | conflict{message} | network{message} | server{message}`; `parseRegisterLearnerError(status,body)`, `networkError(msg?)`.

## Error mapping

| Status | Kind | UI |
|---|---|---|
| 422 | `validation` | FastAPI `detail[] {loc,msg}`: `loc=["body",field]` → `fieldErrors[field]` (first wins, strips `Value error,`), else → `formError`. String `detail` → `formError` |
| 409 | `conflict` | Banner, fallback “An account with these details already exists.” |
| other non-2xx | `server` | Banner, fallback “Something went wrong…” |
| fetch throws | `network` | Banner “Couldn't reach the server…” |

## Hook (`lib/hooks/useLearnerRegistration.ts`)

`useLearnerRegistration(onSuccess?) → {values,setField(field,value),fieldErrors,formError,submitting,handleSubmit():Promise<boolean>}` — client `validateLearnerForm` first (blocks call), then `registerLearner`, maps `validation→fields+banner`, others→banner. Editing a field clears its error + `formError`. UI-free for tests. Used only by `app/(auth)/signup.tsx` (success → `/intro`).

## Validation (`lib/validation/learner.ts`)

Pure functions + `validateLearnerForm` (incl. cross-field `email !== guardian_email`, case-insensitive). Rules: email regex + ≤320; phone strip spaces/dashes → `^\+?[1-9]\d{6,14}$`; DOB `YYYY-MM-DD`, not future, 3–100y; password 8–72 + letter+digit; name/school required ≤255. Backend authoritative — client is feedback only.

## Adding an endpoint

1. Types in `types.ts` → error kind in `errors.ts` → fetch fn in `learners.ts` (or new `lib/api/<res>.ts`) returning `Result`, never throw.
2. Hook in `lib/hooks/` for state, screen stays thin.
3. Tests mirroring in `__tests__/lib/` — see [testing](testing.md).
