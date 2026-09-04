# Navigation

File-based routing via Expo Router. Route groups `(auth)`/`(tabs)` are URL-invisible — file `app/(auth)/login.tsx` = path `/login`.

## Route table

| File | Path | What |
|---|---|---|
| `app/index.tsx` | `/` | `Redirect` → `/welcome` |
| `app/+not-found.tsx` | unmatched | Oops + `Link /` |
| `app/+html.tsx` | web shell | Scroll reset, bg |
| `app/(auth)/_layout.tsx` | — | `Stack{headerShown:false}` wrapper |
| `app/(auth)/welcome.tsx` | `/welcome` | Splash: BrandMark + tagline + Continue → `/login` |
| `app/(auth)/role.tsx` | `/role` | Learner (primary) / Guardian (outline) → `/signup`, Link `/login` |
| `app/(auth)/login.tsx` | `/login` | Static fields (no API yet), Log In → `/onboarding`, Google btn, Link `/role` |
| `app/(auth)/signup.tsx` | `/signup` | Live registration via `useLearnerRegistration`, success → `/intro` |
| `app/(auth)/intro.tsx` | `/intro` | `INTRO_CAROUSEL` 3 slides, dots, Continue → next / `/onboarding` |
| `app/(auth)/onboarding.tsx` | `/onboarding` | Thin wrapper → `<OnboardingFlow/>` |
| `app/(tabs)/_layout.tsx` | — | `Tabs{tabBar:BottomTabBar}`: home/explore/portfolio/profile |
| `app/(tabs)/home.tsx` | `/home` | Greeting, XpBar, NextBestAction → `/onboarding`, journey strip, explore cards |
| `app/(tabs)/explore.tsx` | `/explore` | Search + uni cards (Stellenbosch, UCT — static mock) |
| `app/(tabs)/portfolio.tsx` | `/portfolio` | APS 32, psychometric card (static) |
| `app/(tabs)/profile.tsx` | `/profile` | Score badge, ThemeToggle, detail rows, sign-out `replace(/welcome)` |

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
3. Guard auth manually today — no auth context yet; post-signup flow is just `push/replace` chain.

See [components](components.md) for `PrimaryButton/BackButton`, [domain-logic](domain-logic.md) for onboarding steps data.
