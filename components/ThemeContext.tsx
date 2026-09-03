import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { darkTheme, getShadow, lightTheme, type ThemeColors } from "@/lib/theme";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "yu_app_theme";

type ThemeContextValue = {
  theme: ThemeMode;
  colors: ThemeColors;
  shadow: ReturnType<typeof getShadow>;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark") setThemeState(stored);
    });
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((cur) => {
      const next = cur === "dark" ? "light" : "dark";
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const colors = theme === "dark" ? darkTheme : lightTheme;
  const shadow = useMemo(() => getShadow(colors), [colors]);

  const value = useMemo(
    () => ({ theme, colors, shadow, setTheme, toggleTheme, isDark: theme === "dark" }),
    [theme, colors, shadow, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
