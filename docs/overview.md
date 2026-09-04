# Overview

Your-UniVerse mobile app — Expo SDK 57 + Expo Router + React Native 0.86 + React 19 + TypeScript (strict). Proprietary to Lynxio-tech.

This page is the entry point: what the app is, stack, and where things live. Follow links for detail.

## What it does

- Auth flow: splash → welcome → role → signup/login → intro carousel → onboarding wizard.
- Main app (tabs): Home (XP, journey, explore cards), Explore (unis/bursaries), Portfolio (APS/psychometric), Profile (score, settings, sign-out).
- Backend integration (only one so far): `POST /learners` for registration — see [learner-registration](learner-registration.md) and [api-client](api-client.md).

## Stack

| Layer | Choice |
|---|---|
| Runtime | Expo SDK `^57.0.19`, RN `0.86.3`, React `19.2.3` |
| Navigation | `expo-router@~57.0.18`, typed routes on (`app.json` → `experiments.typedRoutes`) |
| Styling | StyleSheet + theme tokens in `lib/theme.ts`, no Tailwind/NativeWind |
| Theming | `components/ThemeContext.tsx` (dark default, AsyncStorage `yu_app_theme`) |
| Animations | `react-native-reanimated@4.5.1`, `react-native-svg`, `expo-linear-gradient`, `expo-blur` |
| Fonts | Inter + SpaceGrotesk + InstrumentSerif via `@expo-google-fonts/*`, loaded in `app/_layout.tsx` |
| Tests | `jest-expo` + `@testing-library/react-native@^14` |
| Config | `app.json`, `tsconfig.json` (`@/*` alias), `babel.config.js` (reanimated plugin), `metro.config.js` passthrough |

See [architecture](architecture.md) for provider tree and layering, [getting-started](getting-started.md) to run it.

## Repo map

```
app/                  Expo Router routes
  _layout.tsx         Root: fonts, splash, SafeArea > Theme > Stack + LoadingScreen
  index.tsx           Redirect → /welcome
  (auth)/             welcome, role, login, signup, intro, onboarding
  (tabs)/             home, explore, portfolio, profile (BottomTabBar)
components/           UI kit (ui.tsx) + feature/background/brand components
lib/
  api/                config.ts, types.ts, errors.ts, learners.ts
  validation/         learner.ts (client mirror of backend rules)
  hooks/              useLearnerRegistration.ts
  theme.ts            Design tokens (darkTheme/lightTheme/brand/radii/fonts)
  onboarding-steps.ts Step defs + option lists + INTRO_CAROUSEL
  universe-score.ts   calculateUniverseScore() 0–1000 + tiers
  brand-mark.ts       SVG path/viewbox for logo mark
  figma-assets.ts     Remote Figma image URLs
constants/Colors.ts   Legacy template only — do NOT use, use lib/theme.ts
__tests__/lib/        Mirrors lib/ (api, validation, hooks)
assets/               icon/splash/favicon + adaptive icons + SpaceMono font
docs/                 This wiki (see README)
app.json              Expo config (name/slug/scheme/plugins)
.env / .env.local     API base URL (gitignored local overrides)
```

## Key conventions (TL;DR)

- `@/*` imports only, never long `../../`.
- No `any` — strict TS, fix the type.
- Colors/fonts/radii from `useTheme()` + `lib/theme.ts`, never hardcoded.
- Non-UI logic in `lib/`, shared UI in `components/`, routes thin in `app/`.
- New feature/screen/pattern → new `docs/*.md` page in same PR.
- Check versioned Expo docs before touching Expo APIs: https://docs.expo.dev/versions/v57.0.0/

Next: [getting-started](getting-started.md) · [architecture](architecture.md) · [navigation](navigation.md)
