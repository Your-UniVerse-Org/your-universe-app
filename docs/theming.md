# Theming

Single source: `lib/theme.ts` + `components/ThemeContext.tsx`. Ignore `constants/Colors.ts` (Expo template leftover).

## Tokens (`lib/theme.ts`)

- `brand`: purple `#774DFF`, purpleDark `#5E38D4`, orange `#FE4A23`, orangeText `#FF6B47`, white.
- `darkTheme` (default, bg `#0F172A`) / `lightTheme` (bg `#F8FAFC`) — both implement `ThemeColors`: bg/surface/surface2/surface3, purple/orange (+Dim/Border/Glow), danger(+Dim), text1/2/3, border/borderPurple, gridLine, beam*/orb*, statusBar, gradient[3], topGlow[3], beamsVisible + legacy `navy/text/textMuted/card`.
- `radii`: sm 6 / md 12 / lg 20 / xl 32 / pill 100.
- `fonts`: `sans` Inter_400, `sansMedium/Bold…`, `ui` SpaceGrotesk_600, `uiBold`, `display` InstrumentSerif (+Italic). Must match names loaded in `app/_layout.tsx`.
- `getShadow(c)`: `{purple, card}` (card adapts to bg).
- `colors` export = `darkTheme`, `@deprecated` — don't import it.

## Usage

```tsx
import { useTheme } from "@/components/ThemeContext";
import { radii, fonts } from "@/lib/theme";

const { colors, shadow, theme, setTheme, toggleTheme, isDark } = useTheme();
// style={{ backgroundColor: colors.surface2, borderColor: colors.border }}
```

- `ThemeProvider`: initial `"dark"`, hydrates `AsyncStorage yu_app_theme`, persists on change.
- Switcher: `components/ThemeToggle.tsx` (`compact` icon button or full segmented). Used on home + profile.
- Backgrounds read `colors.gradient/topGlow/gridLine/beam*` — see `GalacticBackground`/`ElectricBeams` in [components](components.md).

## Rules

- Never hardcode hex in screens/components — use `colors.*`.
- New token? Add to `ThemeColors` + both themes, not inline.
- `Themed.tsx`/`useColorScheme` are legacy template shims — prefer `useTheme()` for new code.
