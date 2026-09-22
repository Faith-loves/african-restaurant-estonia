"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemePreference } from "@/context/ThemeContext";

const options: ThemePreference[] = ["light", "dark", "system"];

const labels: Record<ThemePreference, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export default function ThemeToggle({ mobile = false }: { mobile?: boolean }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const nextTheme = options[(options.indexOf(theme) + 1) % options.length];
  const Icon = theme === "system" ? Monitor : theme === "dark" ? Moon : Sun;
  const label = `Theme: ${labels[theme]}. Select ${labels[nextTheme]} theme`;

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      aria-label={label}
      title={label}
      className={mobile
        ? "flex min-h-11 w-full items-center justify-between rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] px-4 py-3 text-sm font-extrabold text-[#321B29] transition hover:border-[#D89A27] focus-visible:outline-none"
        : "flex min-h-10 items-center gap-2 rounded-lg border border-[#321B29]/15 bg-[#FFF8EC] px-3 py-2 text-xs font-extrabold text-[#321B29] transition hover:border-[#D89A27] focus-visible:outline-none"}
    >
      <span className="flex items-center gap-2"><Icon size={17} aria-hidden="true" /><span>{labels[theme]}</span></span>
      {mobile && <span className="text-xs font-semibold text-[#321B29]/55">{resolvedTheme === "dark" ? "Dark appearance" : "Light appearance"}</span>}
    </button>
  );
}
