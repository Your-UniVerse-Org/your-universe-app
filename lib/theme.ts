/** Your-UniVerse design tokens — dark + light palettes */

export type ThemeColors = {
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  purple: string;
  purpleDark: string;
  purpleDim: string;
  purpleBorder: string;
  purpleGlow: string;
  orange: string;
  orangeDark: string;
  orangeDim: string;
  orangeBorder: string;
  orangeText: string;
  text1: string;
  text2: string;
  text3: string;
  white: string;
  grey: string;
  border: string;
  borderPurple: string;
  gridLine: string;
  beamPrimary: string;
  beamSecondary: string;
  beamOrange: string;
  beamArc: string;
  orbPurple: string;
  orbOrange: string;
  statusBar: "light" | "dark";
  gradient: [string, string, string];
  topGlow: [string, string, string];
  beamsVisible: boolean;
  // legacy aliases
  navy: string;
  text: string;
  textMuted: string;
  textSecondary: string;
  card: string;
};

export const brand = {
  purple: "#774DFF",
  purpleDark: "#5E38D4",
  orange: "#FE4A23",
  orangeText: "#FF6B47",
  white: "#FFFFFF",
};

export const darkTheme: ThemeColors = {
  bg: "#0F172A",
  surface: "#141E2E",
  surface2: "#1A2744",
  surface3: "#1F3050",
  purple: brand.purple,
  purpleDark: brand.purpleDark,
  purpleDim: "rgba(119,77,255,0.10)",
  purpleBorder: "rgba(119,77,255,0.22)",
  purpleGlow: "rgba(119,77,255,0.35)",
  orange: brand.orange,
  orangeDark: "#D93D1A",
  orangeDim: "rgba(254,74,35,0.10)",
  orangeBorder: "rgba(254,74,35,0.25)",
  orangeText: brand.orangeText,
  text1: "#F1F5F9",
  text2: "#94A3B8",
  text3: "#475569",
  white: brand.white,
  grey: "#F3F4F6",
  border: "rgba(255,255,255,0.07)",
  borderPurple: "rgba(119,77,255,0.20)",
  gridLine: "rgba(148,163,184,0.08)",
  beamPrimary: "rgba(119,77,255,0.5)",
  beamSecondary: "rgba(119,77,255,0.35)",
  beamOrange: "rgba(254,74,35,0.35)",
  beamArc: "rgba(119,77,255,0.4)",
  orbPurple: "rgba(119,77,255,0.06)",
  orbOrange: "rgba(254,74,35,0.05)",
  statusBar: "light",
  gradient: ["#0F172A", "#141E2E", "#0F172A"],
  topGlow: ["rgba(119,77,255,0.18)", "rgba(119,77,255,0.04)", "transparent"],
  beamsVisible: true,
  navy: "#0F172A",
  text: "#F1F5F9",
  textMuted: "#94A3B8",
  textSecondary: "#94A3B8",
  card: "#141E2E",
};

export const lightTheme: ThemeColors = {
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  surface2: "#F1F5F9",
  surface3: "#E2E8F0",
  purple: brand.purple,
  purpleDark: brand.purpleDark,
  purpleDim: "rgba(119,77,255,0.08)",
  purpleBorder: "rgba(119,77,255,0.18)",
  purpleGlow: "rgba(119,77,255,0.20)",
  orange: brand.orange,
  orangeDark: "#D93D1A",
  orangeDim: "rgba(254,74,35,0.08)",
  orangeBorder: "rgba(254,74,35,0.20)",
  orangeText: brand.orangeText,
  text1: "#0F172A",
  text2: "#475569",
  text3: "#94A3B8",
  white: brand.white,
  grey: "#F3F4F6",
  border: "rgba(15,23,42,0.08)",
  borderPurple: "rgba(119,77,255,0.15)",
  gridLine: "rgba(15,23,42,0.07)",
  beamPrimary: "rgba(119,77,255,0.28)",
  beamSecondary: "rgba(119,77,255,0.18)",
  beamOrange: "rgba(254,74,35,0.22)",
  beamArc: "rgba(119,77,255,0.22)",
  orbPurple: "rgba(119,77,255,0.08)",
  orbOrange: "rgba(254,74,35,0.06)",
  statusBar: "dark",
  gradient: ["#F8FAFC", "#EEF2FF", "#F1F5F9"],
  topGlow: ["rgba(119,77,255,0.14)", "rgba(119,77,255,0.05)", "transparent"],
  beamsVisible: true,
  navy: "#0F172A",
  text: "#0F172A",
  textMuted: "#475569",
  textSecondary: "#475569",
  card: "#FFFFFF",
};

/** @deprecated Use useTheme() for theme-aware colors */
export const colors = darkTheme;

export const radii = {
  sm: 6,
  md: 12,
  lg: 20,
  xl: 32,
  pill: 100,
};

export const fonts = {
  sans: "Inter_400Regular",
  sansMedium: "Inter_500Medium",
  sansSemiBold: "Inter_600SemiBold",
  sansBold: "Inter_700Bold",
  ui: "SpaceGrotesk_600SemiBold",
  uiBold: "SpaceGrotesk_700Bold",
  display: "InstrumentSerif_400Regular",
  displayItalic: "InstrumentSerif_400Regular_Italic",
};

export function getShadow(c: ThemeColors) {
  return {
    purple: {
      shadowColor: c.purple,
      shadowOpacity: 0.25,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    card: {
      shadowColor: "#000",
      shadowOpacity: c.bg === darkTheme.bg ? 0.4 : 0.08,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
  };
}
