"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useState } from "react";

import { useLanguage } from "@/context/LanguageContext";

const AUTOPLAY_MS = 11000;

export default function Hero() {
  const { t } = useLanguage();
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % 2);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [activeSlide]);

  function moveSlide(direction: -1 | 1) {
    setActiveSlide((current) => (current + direction + 2) % 2);
  }

  return (
    <section id="home" aria-roledescription="carousel" aria-label="African Restaurant Estonia highlights" className="relative min-h-[calc(100svh-106px)] overflow-hidden sm:min-h-[calc(100vh-114px)]">
      <div className="absolute inset-0">
        <div className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${activeSlide === 0 ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={activeSlide !== 0}>
          <Image src="/images/hero/hero-food.png" alt="West African food from African Restaurant Estonia" fill priority sizes="100vw" className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#151313]/90 via-[#321B29]/70 to-[#151313]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#151313]/55 via-transparent to-transparent" />
        </div>

        <div className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${activeSlide === 1 ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={activeSlide !== 1}>
          <Image src="/images/hero/catering-hero.jpg" alt="Food prepared for catering and events" fill sizes="100vw" className="object-cover object-[38%_center] sm:object-center" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#151313]/90 via-[#321B29]/65 to-[#151313]/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#151313]/60 via-transparent to-transparent" />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-106px)] max-w-[1440px] items-center px-5 py-14 sm:min-h-[calc(100vh-114px)] sm:px-8 sm:py-20 lg:px-12">
        {activeSlide === 0 ? (
          <div className="max-w-[760px] animate-[entry-writing_500ms_ease-out] motion-reduce:animate-none">
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.24em] text-[#D89A27]">{t("hero.eyebrow")}</p>
            <h1 className="max-w-full break-words font-[var(--font-cormorant)] text-[42px] font-bold leading-[0.92] text-[#FFF8EC] sm:text-[68px] md:text-[82px] lg:text-[92px]">
              {t("hero.titleLine1")}<br />{t("hero.titleLine2")}<br /><span className="text-[#D89A27]">{t("hero.titleLine3")}</span>
            </h1>
            <p className="mt-7 max-w-[620px] text-base leading-8 text-[#FFF8EC]/85 sm:text-lg">{t("hero.description")}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/menu" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#D89A27] px-6 py-4 font-bold text-[#321B29] transition hover:bg-[#FFF8EC] focus:outline-none focus:ring-2 focus:ring-[#FFF8EC] focus:ring-offset-2 focus:ring-offset-[#321B29]">{t("hero.startOrder")}<ArrowRight size={18} /></Link>
              <Link href="/menu?filter=today" className="inline-flex items-center justify-center gap-2 rounded-md border border-[#FFF8EC]/50 bg-[#FFF8EC]/10 px-6 py-4 font-semibold text-[#FFF8EC] transition hover:bg-[#FFF8EC] hover:text-[#321B29] focus:outline-none focus:ring-2 focus:ring-[#D89A27]">{t("hero.todayMenu")}</Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-5 text-sm font-semibold text-[#FFF8EC]/90"><span className="flex items-center gap-2"><Truck size={18} className="text-[#D89A27]" />{t("hero.delivery")}</span><span className="flex items-center gap-2"><ShoppingBag size={18} className="text-[#D89A27]" />{t("hero.pickup")}</span></div>
          </div>
        ) : (
          <div className="ml-auto w-full max-w-[600px] animate-[entry-writing_500ms_ease-out] text-left motion-reduce:animate-none">
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-[#D89A27]">{t("hero.cateringEyebrow")}</p>
            <h2 className="max-w-full break-words font-[var(--font-cormorant)] text-[42px] font-bold leading-[0.92] text-[#FFF8EC] sm:text-[68px] md:text-[78px]">{t("hero.cateringTitle")}</h2>
            <p className="mt-7 max-w-[530px] text-base leading-8 text-[#FFF8EC]/85 sm:text-lg">{t("hero.cateringDescription")}</p>
            <Link href="/catering" className="mt-9 inline-flex items-center justify-center gap-2 rounded-md bg-[#D89A27] px-6 py-4 font-bold text-[#321B29] transition hover:bg-[#FFF8EC] focus:outline-none focus:ring-2 focus:ring-[#FFF8EC] focus:ring-offset-2 focus:ring-offset-[#321B29]">{t("hero.exploreCatering")}<ArrowRight size={18} /></Link>
          </div>
        )}
      </div>

      <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
        <button type="button" onClick={() => moveSlide(-1)} aria-label={t("hero.previous")} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#FFF8EC]/30 bg-[#151313]/20 text-[#FFF8EC] transition hover:border-[#D89A27] hover:bg-[#D89A27] hover:text-[#321B29] focus:outline-none focus:ring-2 focus:ring-[#D89A27]"><ChevronLeft size={17} aria-hidden /></button>
        <div className="flex items-center gap-2" role="tablist" aria-label="Hero slides">
          {[0, 1].map((index) => <button key={index} type="button" role="tab" aria-selected={activeSlide === index} aria-label={`${t("hero.slide")} ${index + 1}`} onClick={() => setActiveSlide(index)} className={`h-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#FFF8EC] focus:ring-offset-2 focus:ring-offset-[#321B29] ${activeSlide === index ? "w-8 bg-[#D89A27]" : "w-2.5 bg-[#FFF8EC]/55 hover:bg-[#FFF8EC]"}`} />)}
        </div>
        <button type="button" onClick={() => moveSlide(1)} aria-label={t("hero.next")} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#FFF8EC]/30 bg-[#151313]/20 text-[#FFF8EC] transition hover:border-[#D89A27] hover:bg-[#D89A27] hover:text-[#321B29] focus:outline-none focus:ring-2 focus:ring-[#D89A27]"><ChevronRight size={17} aria-hidden /></button>
      </div>
    </section>
  );
}
