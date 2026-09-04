# Navigation

File-based routing via Expo Router. Route groups `(auth)`/`(tabs)` are URL-invisible — file `app/(auth)/login.tsx` = path `/login`.

## Route table

| File | Path | What |
|---|---|---|
| `app/index.tsx` | `/` | `Redirect` → `/home` if `useSession().status === "signedIn"`, else `/welcome` (renders nothing while `"loading"`) — see [session](session.md) |
| `app/+not-found.tsx` | unmatched | Oops + `Link /` |
| `app/+html.tsx` | web shell | Scroll reset, bg |
| `app/(auth)/_layout.tsx` | — | `Stack{headerShown:false}` wrapper |
| `app/(auth)/welcome.tsx` | `/welcome` | Splash: BrandMark + tagline + Continue → `/login` |
| `app/(auth)/role.tsx` | `/role` | Learner (primary) / Guardian (outline) → `/signup`, Link `/login` |
| `app/(auth)/login.tsx` | `/login` | Learner sign-in, live via `useLearnerLogin` (`POST /learners/login`), success → `replace(/home)`, Link `/guardian-login`, Link `/role` |
| `app/(auth)/guardian-login.tsx` | `/guardian-login` | Guardian sign-in — UI only, submit shows a "coming soon" message (Supabase Auth not integrated yet), Link `/login` |
| `app/(auth)/signup.tsx` | `/signup` | Live registration via `useLearnerRegistration`, success → `/intro` |
| `app/(auth)/intro.tsx` | `/intro` | `INTRO_CAROUSEL` 3 slides, dots, Continue → next / `/onboarding` |
| `app/(auth)/onboarding.tsx` | `/onboarding` | Thin wrapper → `<OnboardingFlow/>` |
| `app/(tabs)/_layout.tsx` | — | `Tabs{tabBar:BottomTabBar}`: home/explore/portfolio/profile. **Route-guarded**: redirects to `/welcome` unless `useSession().status === "signedIn"` — see [session](session.md) |
| `app/(tabs)/home.tsx` | `/home` | Greeting, XpBar, NextBestAction → `/onboarding`, journey strip, explore cards |
| `app/(tabs)/explore.tsx` | `/explore` | Search + uni cards (Stellenbosch, UCT — static mock) |
| `app/(tabs)/portfolio.tsx` | `/portfolio` | APS 32, psychometric card (static) |
| `app/(tabs)/profile.tsx` | `/profile` | Score badge, ThemeToggle, detail rows, sign-out → `session.logout()` then `replace(/welcome)` |

## How to navigate

```tsx
import { router, Link, Redirect } from "expo-router";
router.push("/login");     // stack push
router.replace("/home");   // reset (used after onboarding, sign-out)
router.back();
<Link href="/role">…</Link>
<PrimaryButton label="Continue" href="/login" /> // or onPress
```

`BottomTabBar` gets `state`/`navigation` from `Tabs` and calls `navigation.navigate(name)` — custom floating glass pill (`BlurView` native, plain overlay on web).

## Adding a route

1. Add file under `app/(auth)/` or `app/(tabs)/` (add `Tabs.Screen` too for tabs).
2. Keep screen thin: layout + `GalacticBackground` + `ScreenEntrance` + hook.
3. A new `app/(tabs)/*` screen is auto-guarded by the layout's `useSession()` check — no
   per-screen auth code needed. A new `app/(auth)/*` screen needing a learner's own identity
   (rare — most of `(auth)` is pre-login) should read `useSession()` directly instead of adding
   another layout guard. See [session](session.md).

See [components](components.md) for `PrimaryButton/BackButton`, [domain-logic](domain-logic.md) for onboarding steps data, [session](session.md) for login/session state.
