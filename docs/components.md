# Components

Reusable UI lives in `components/`. Screens compose these — don't rebuild buttons/fields per screen.

## UI kit (`components/ui.tsx`, all `useTheme()`-aware)

| Export | Props | Notes |
|---|---|---|
| `PrimaryButton` | `label, href?, onPress?, variant primary\|orange\|ghost\|outline, disabled?, loading?` | `href` → `router.push`, else `onPress`; spinner when `loading`, ignores presses when disabled/loading |
| `AuthField` | `label, value, onChangeText, error?, secure?, leadingIcon?, trailingIcon?, keyboardType?, autoCapitalize?, placeholder?, testID?` | Danger border + error text; icons are remote URIs via `FIGMA_ASSETS` |
| `SegmentedField<T>` | `label, value: T\|null, options{value,label}[], onChange, error?` | Pill row; used for gender (`GENDER_OPTIONS`) |
| `FormError` | `message?` | Null when empty; danger banner for form-level errors |
| `OrDivider` / `GoogleSignInButton` | — / `onPress?` | Static Google button (no OAuth wired yet) |
| `BackButton` | `onPress?` | Default `router.back()` |
| `ProgressBar` | `step, total=6` | Segmented bar + `01/06` counter |
| `ScreenTitle` | `title, subtitle?` | Display 32 + sub |

## Shell / atmosphere

- `ThemeContext.tsx`: `ThemeProvider`, `useTheme() → {theme,colors,shadow,setTheme,toggleTheme,isDark}`.
- `ThemeToggle.tsx`: `compact?` — icon or segmented control.
- `GalacticBackground({children,variant default\|splash})`: bg + `LinearGradient(colors.gradient)` + SVG grid + `ElectricBeams` + orbs. Wrap every auth/onboarding screen.
- `ElectricBeams()`: reanimated `withRepeat/withSequence` SVG beams, reads `colors.beam*`.
- `BottomTabBar({state,navigation})`: floating glass pill; `TABS` home/explore/portfolio/profile (Ionicons outline→filled); active = purple pill + label.
- `LoadingScreen({onComplete,durationMs=2800})`: BrandMark scale/fade + progress bar → `runOnJS(onComplete)`.
- `ScreenEntrance({delay?})`: fade + translateY 12→0, 350ms.
- `BrandLogo.tsx`: `BrandMark{height?,color?}` (SVG path from `lib/brand-mark.ts`) + `BrandLogo{showText?…}` wordmark.
- `AppHeader.tsx`: legacy logo+avatar header (unused, prefer per-screen headers).

## Feature widgets

- `GameCard({title?,subtitle?,accent purple\|orange,children})` + `Pill({label,accent?})` + `StatNumber({value,label})` — gradient-border cards for explore/home.
- `OnboardingFlow()`: 7-step wizard (see [domain-logic](domain-logic.md) steps). Local `stepIndex`/`selections`, `toggle multi/single`, `next/skip → replace(/home)`, `ProgressBar`, card/chip select. No persistence yet.
- `YourUniverseScore({apsScore=32,profileCompletion=75,xpPoints=240,portfolioItems=3,variant full\|compact\|badge})`: wraps `calculateUniverseScore`; full = breakdown bars, compact = score+tier, badge = circle.
- `XpBar({level,xp,maxXp,title})`, `NextBestAction({title,subtitle,cta,onPress?})`, `MyJourneyStrip()` (grades 9–12 + Transition strip), `FloatingBadge({label,accent?,delay?,icon?})`.
- `StyledText.tsx` (Mono/SpaceMono), `ExternalLink({href})` (web `_blank` / native `WebBrowser`), `EditScreenInfo` (template, unused), `Themed.tsx`/`useColorScheme`/`useClientOnlyValue` (template shims).

New shared UI → add here, theme-aware, document props in this page.
