# Architecture

Layering, provider tree, and where new code goes.

## Provider tree (`app/_layout.tsx`)

```
SafeAreaProvider
  ThemeProvider (components/ThemeContext.tsx, default "dark", persists yu_app_theme)
    View
      RootNavigator (Stack: index, (auth), (tabs); headerShown:false)
      LoadingScreen overlay (until splashDone, ~2800ms)
```

`RootNavigator` uses `useTheme().colors` for `StatusBar` style + Stack `contentStyle.bg`. Fonts must load before anything renders (`if (!loaded) return null`).

## Layering rule

```
app/          Routes only — thin, compose components + hooks, no business logic
components/   Reusable UI (ui.tsx kit + feature widgets + backgrounds)
lib/
  api/        Backend I/O (config/types/errors/learners)
  validation/ Pure client-side checks (fast feedback only)
  hooks/      Stateful glue (form state + API + error mapping), UI-free
  theme.ts, universe-score.ts, onboarding-steps.ts, brand-mark.ts, figma-assets.ts
```

- Screen imports hook, hook imports `lib/api/*` + `lib/validation/*`. Never fetch directly from `app/`.
- Hook is UI-free so it can be unit-tested without rendering (`GalacticBackground`/fonts/SVG are heavy) — see [learner-registration](learner-registration.md).
- Backend is source of truth; client validation is UX convenience and may drift — always still render server 422s.

## State

No Redux/Zustand. Local `useState` per screen/hook + `ThemeContext` for theme only. Onboarding wizard state (`stepIndex`, `selections: Record<number,string[]>`) lives in `components/OnboardingFlow.tsx`. Registration form state lives in `lib/hooks/useLearnerRegistration.ts`.

## Imports & types

- `@/*` alias (tsconfig `paths`) — e.g. `@/lib/api/config`, `@/components/ui`.
- Strict TS, no `any`. Shared API shapes in `lib/api/types.ts` (hand-mirrored with backend `schemas/learner.py`).
- Typed routes on — use `Href` type + `router.push/replace` with literal paths.

## Related

- [navigation](navigation.md) · [theming](theming.md) · [components](components.md) · [api-client](api-client.md) · [domain-logic](domain-logic.md)
