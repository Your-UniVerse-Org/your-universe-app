# Architecture

Layering, provider tree, and where new code goes.

## Provider tree (`app/_layout.tsx`)

```
SafeAreaProvider
  ThemeProvider (components/ThemeContext.tsx, default "dark", persists yu_app_theme)
    SessionProvider (components/SessionContext.tsx, refreshes stored tokens on mount)
      View
        RootNavigator (Stack: index, (auth), (tabs); headerShown:false)
        LoadingScreen overlay (until splashDone, ~2800ms)
```

`RootNavigator` uses `useTheme().colors` for `StatusBar` style + Stack `contentStyle.bg`. Fonts must load before anything renders (`if (!loaded) return null`). `SessionProvider`'s own bootstrap (a `POST /auth/refresh` call against any stored refresh token) runs independently of the fixed-duration `LoadingScreen` splash — see [session](session.md) for how `app/index.tsx`/`app/(tabs)/_layout.tsx` handle the brief `"loading"` window if the network call outlasts the splash.

## Layering rule

```
app/          Routes only — thin, compose components + hooks, no business logic
components/   Reusable UI (ui.tsx kit + feature widgets + backgrounds) + SessionContext/ThemeContext
lib/
  api/        Backend I/O (config/types/errors/learners/auth)
  validation/ Pure client-side checks (fast feedback only)
  hooks/      Stateful glue (form state + API + error mapping), UI-free
  auth/       Token storage (AsyncStorage wrapper) + feature flags — no React, no fetch
  theme.ts, universe-score.ts, onboarding-steps.ts, brand-mark.ts, figma-assets.ts
```

`components/SessionContext.tsx` is the one exception to "components aren't `lib/`-layer logic":
it's a context/provider (so it lives in `components/`, matching `ThemeContext.tsx`), but the
logic worth unit-testing inside it (token storage, the login/refresh API calls) is factored out
into `lib/auth/` and `lib/api/auth.ts` rather than living inline — see [testing](testing.md) for
why (components aren't render-tested here) and [session](session.md) for the full design.

- Screen imports hook, hook imports `lib/api/*` + `lib/validation/*`. Never fetch directly from `app/`.
- Hook is UI-free so it can be unit-tested without rendering (`GalacticBackground`/fonts/SVG are heavy) — see [learner-registration](learner-registration.md).
- Backend is source of truth; client validation is UX convenience and may drift — always still render server 422s.

## State

No Redux/Zustand. Local `useState` per screen/hook + `ThemeContext` for theme, `SessionContext`
for auth (`status`/`accessToken`/`login`/`logout`, persisted to `AsyncStorage` — see
[session](session.md)). Onboarding wizard state (`stepIndex`, `selections: Record<number,string[]>`) lives in `components/OnboardingFlow.tsx`. Registration form state lives in `lib/hooks/useLearnerRegistration.ts`; login form state in `lib/hooks/useLearnerLogin.ts`.

## Imports & types

- `@/*` alias (tsconfig `paths`) — e.g. `@/lib/api/config`, `@/components/ui`.
- Strict TS, no `any`. Shared API shapes in `lib/api/types.ts` (hand-mirrored with backend `schemas/learner.py`).
- Typed routes on — use `Href` type + `router.push/replace` with literal paths.

## Related

- [navigation](navigation.md) · [theming](theming.md) · [components](components.md) · [api-client](api-client.md) · [session](session.md) · [domain-logic](domain-logic.md)
