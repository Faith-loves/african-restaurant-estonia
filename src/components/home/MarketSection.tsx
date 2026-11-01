"use client";

import { Package, ShoppingBag, Sparkles } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

export default function MarketSection() {
  const { t } = useLanguage();
  const marketLabel = t("market.label").split(" ");

  return (
    <section id="market" className="bg-white px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
      <div className="mx-auto max-w-[1312px]">
        <div className="relative overflow-hidden rounded-[32px] bg-[#321B29] px-6 py-10 text-[#FFF8EC] shadow-[0_24px_70px_rgba(50,27,41,0.18)] sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="absolute -right-24 -top-24 h-[340px] w-[340px] rounded-full bg-[#D89A27]/10" />
          <div className="absolute -bottom-40 left-[30%] h-[350px] w-[350px] rounded-full bg-[#B9472E]/20" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_0.75fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D89A27]/25 bg-[#D89A27]/10 px-4 py-2 text-[#D89A27]"><Sparkles size={14} /><span className="text-[10px] font-extrabold uppercase tracking-[0.18em]">{t("market.comingSoon")}</span></div>
              <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.22em] text-[#D89A27]">{t("market.eyebrow")}</p>
              <h2 className="mt-3 max-w-[720px] font-[var(--font-cormorant)] text-4xl font-bold leading-[0.95] sm:text-6xl lg:text-7xl">{t("market.title")}</h2>
              <p className="mt-5 max-w-[650px] text-sm font-semibold leading-7 text-[#FFF8EC]/70 sm:text-base">{t("market.description")}</p>
              <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-[#FFF8EC]/10 bg-[#FFF8EC]/[0.06] px-5 py-4"><ShoppingBag size={19} className="text-[#D89A27]" /><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#FFF8EC]/45">{t("market.status")}</p><p className="mt-0.5 font-bold text-[#FFF8EC]">{t("market.launch")}</p></div></div>
            </div>

            <div className="relative mx-auto flex w-full max-w-[430px] items-center justify-center">
              <div className="absolute h-[300px] w-[300px] rounded-full border border-[#D89A27]/15 sm:h-[350px] sm:w-[350px]" />
              <div className="absolute h-[220px] w-[220px] rounded-full border border-[#FFF8EC]/10 sm:h-[260px] sm:w-[260px]" />
              <div className="relative flex h-[190px] w-[190px] flex-col items-center justify-center rounded-full bg-[#D89A27] text-center text-[#321B29] shadow-[0_25px_60px_rgba(0,0,0,0.22)] sm:h-[220px] sm:w-[220px]"><Package size={36} /><p className="mt-4 font-[var(--font-cormorant)] text-3xl font-bold leading-none">{marketLabel[0]}<br />{marketLabel.slice(1).join(" ")}</p><p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.15em]">{t("market.comingSoon")}</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
