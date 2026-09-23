"use client";

import { ChevronDown } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { languageLabels, supportedLanguages } from "@/i18n/translations";

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t("nav.language")}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as typeof language)}
        aria-label={t("nav.language")}
        className="min-h-10 appearance-none rounded-lg border border-[#321B29]/15 bg-[#FFF8EC] py-2 pl-3 pr-8 text-xs font-extrabold tracking-[0.08em] text-[#321B29] outline-none transition hover:border-[#D89A27] focus:border-[#D89A27] focus:ring-2 focus:ring-[#D89A27]/35"
      >
        {supportedLanguages.map((option) => (
          <option key={option} value={option}>
            {languageLabels[option]}
          </option>
        ))}
      </select>
      <ChevronDown size={14} aria-hidden className="pointer-events-none absolute right-2.5 text-[#321B29]/55" />
    </label>
  );
}
