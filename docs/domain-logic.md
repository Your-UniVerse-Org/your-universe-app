# Domain logic

Pure, UI-free modules in `lib/` (besides `api/`): onboarding data, scoring, brand assets.

## Onboarding (`lib/onboarding-steps.ts`, UI `components/OnboardingFlow.tsx`)

`OnboardingStep`: `intro | grade(1) | strengths(2,multi,min3max5) | priorities(3,multi) | careers(4,single) | pathway(5,single) | summary(6)`. `ONBOARDING_STEPS[7]` drives wizard order.

Option lists: `GRADE_OPTIONS` (9–12), `STRENGTH_OPTIONS[9]` (Problem Solving…), `PRIORITY_OPTIONS[8]` (Fees, Location…), `CAREER_OPTIONS` (tech/health/business/arts + desc), `PATHWAY_OPTIONS` (university/tvet/private + desc). `INTRO_CAROUSEL[3]` (title + `FIGMA_ASSETS.onboarding.carouselN`) feeds `app/(auth)/intro.tsx`.

Flow state (`stepIndex`, `selections`) is local to `OnboardingFlow`, not persisted — `next/skip` → `router.replace("/home")`. `strengths` min/max not enforced in UI yet.

## Universe Score (`lib/universe-score.ts`, UI `components/YourUniverseScore.tsx`)

`calculateUniverseScore({apsScore,maxAps=42,profileCompletion,xpPoints,maxXp=500,portfolioItems,maxPortfolio=10}) → {score 0–1000, tier, tierColor, breakdown{academic,profile,engagement,portfolio}}`.

Weights: academic 45% + profile 25% + engagement 15% + portfolio 15%; each clamped 0–100, `score = round(composite*10)`. Tiers: ≥901 Universe Master `#FE4A23`, ≥751 Scholar `#774DFF`, ≥601 Achiever `#A78BFF`, ≥401 Pathfinder `#6366F1`, else Explorer `#94A3B8`. Current screens use static inputs (home/profile) — no backend yet.

## Brand & assets

- `brand-mark.ts`: `BRAND_MARK_PATH`, `BRAND_MARK_VIEWBOX="915 397 820 820"`, `BRAND_MARK_ASPECT`, `BRAND_MARK_COLOR="#774DFF"` — rendered by `BrandMark` in `BrandLogo.tsx`.
- `figma-assets.ts`: `FIGMA_ASSETS{nav,logo,auth,home,onboarding,profile}` — **remote Figma URLs** (need network; `expo-image`). If images break, check this file first. Migrate to `assets/` for offline/prod.
- `assets/`: only `icon/splash/favicon` + android adaptive icons + SpaceMono font are local.
