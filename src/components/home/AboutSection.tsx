"use client";

import {
  Heart,
  MapPin,
  UtensilsCrossed,
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

export default function AboutSection() {
  const { t } = useLanguage();
  const translatedHighlights = [
    { icon: Heart, title: t("home.foodWithRoots"), text: t("home.foodWithRootsText") },
    { icon: UtensilsCrossed, title: t("home.moreThanMeal"), text: t("home.moreThanMealText") },
    { icon: MapPin, title: t("home.fromWestAfrica"), text: t("home.fromWestAfricaText") },
  ];
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#321B29] px-5 py-24 sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">

          <div>
            <p className="mb-4 text-sm font-extrabold uppercase tracking-[0.22em] text-[#D89A27]">
              {t("home.storyEyebrow")}
            </p>

            <h2 className="font-[var(--font-cormorant)] text-5xl font-bold leading-[1] text-[#FFF8EC] md:text-6xl">
              {t("home.storyTitle")}
              <br />
              <span className="text-[#D89A27]">
                {t("home.storyTitleAccent")}
              </span>
            </h2>

            <div className="mt-7 max-w-[660px] space-y-5 text-base font-medium leading-8 text-[#FFF8EC]/80">
              <p>
                {t("home.storyParagraph1")}
              </p>

              <p>
                {t("home.storyParagraph2")}
              </p>

              <p>
                {t("home.storyParagraph3")}
              </p>
            </div>

            <p className="mt-7 font-[var(--font-cormorant)] text-2xl font-bold italic text-[#D89A27]">
              {t("home.storyClosing")}
            </p>
          </div>

          <div className="grid gap-5">
            {translatedHighlights.map((item, index) => {
              const Icon = item.icon;
              const isBlueAccent = index === 1;

              return (
                <div
                  key={item.title}
                  className={`rounded-[24px] border p-6 backdrop-blur-sm sm:p-7 ${
                    isBlueAccent
                      ? "border-[#294B73]/70 bg-[#294B73]/35"
                      : "border-white/10 bg-white/[0.06]"
                  }`}
                >
                  <div className="flex gap-5">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${isBlueAccent ? "bg-[#294B73] text-[#FFF8EC]" : "bg-[#D89A27] text-[#321B29]"}`}>
                      <Icon size={22} />
                    </div>

                    <div>
                      <h3 className="font-[var(--font-cormorant)] text-2xl font-bold text-[#FFF8EC]">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm font-medium leading-7 text-[#FFF8EC]/70">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
