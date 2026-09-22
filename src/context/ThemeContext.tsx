"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
};

const STORAGE_KEY = "are-theme";
const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => undefined,
});

function systemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll('meta[name="theme-color"]').forEach((themeColor) => {
    themeColor.setAttribute("content", theme === "dark" ? "#321B29" : "#FFF8EC");
  });
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const preference: ThemePreference = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    window.setTimeout(() => setThemeState(preference), 0);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      const next = preference === "system" ? (media.matches ? "dark" : "light") : preference;
      setResolvedTheme(next);
      applyTheme(next);
    };
    update();
    const handleChange = () => {
      if (preference === "system") update();
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  function setTheme(preference: ThemePreference) {
    setThemeState(preference);
    window.localStorage.setItem(STORAGE_KEY, preference);
    const next = preference === "system" ? systemTheme() : preference;
    setResolvedTheme(next);
    applyTheme(next);
  }

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
