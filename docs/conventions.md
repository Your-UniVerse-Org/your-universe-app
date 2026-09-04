# Conventions

How to write code here so the next dev doesn't curse you.

## Musts

- Versioned Expo docs first for any Expo/nav/config API: https://docs.expo.dev/versions/v57.0.0/ (APIs changed; old tutorials lie). Noted in `AGENTS.md`.
- Strict TS, no `any`. Use `@/*` imports.
- Theme via `useTheme()` + `lib/theme.ts` (`colors/radii/fonts/shadow`) — no hex literals. `constants/Colors.ts` is dead.
- Layers: `app/` thin routes → `components/` UI → `lib/hooks/` state → `lib/api/` + `lib/validation/`. No `fetch` in screens.
- API fns return `Result`, never throw (except `getApiBaseUrl` on missing env).
- Secrets only via `EXPO_PUBLIC_*` + `.env.local`, never committed.
- One topic per `docs/*.md` (`kebab-case`), summary first, cross-link. Feature/screen/pattern PR without docs = rejected.

## Workflow (from root README)

Branch `<type>/<desc>` (`feature/…`, `fix/…`, `chore/…`, `docs/…`) off `main`. Before PR: `npx tsc --noEmit`, `npx expo-doctor`, `npm test`, manual test ≥1 platform. PR needs what/why, how-to-test + platform(s), screenshots/recording for UI, linked issues. CI `PR Checks` must pass.

## Screens checklist

New route under `app/` + thin composition (`GalacticBackground` + `ScreenEntrance` + ui-kit + hook). Add to `Tabs` if tab. Update [navigation](navigation.md). Manual-test light + dark.
