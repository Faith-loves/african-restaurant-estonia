"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function CateringSection() {
  const { t } = useLanguage();
  const translatedOptions = [
    { title: t("home.corporateCatering"), description: t("home.corporateCateringDescription"), image: "/images/catering/corporate-catering.png" },
    { title: t("home.events"), description: t("home.eventsDescription"), image: "/images/catering/event-catering.jpg" },
    { title: t("home.foodGiftBox"), description: t("home.foodGiftBoxDescription"), image: "/images/catering/food-gift-box.png" },
    { title: t("home.bulkOrder"), description: t("home.bulkOrderDescription"), image: "/images/catering/catering.jpg" },
  ];
  return (
    <section
      id="catering"
      className="bg-[#FFF8EC] px-5 py-20 text-[#321B29] sm:px-8 lg:px-12 lg:py-24"
    >
      <div className="mx-auto max-w-[1312px]">

        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">

          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#B9472E]">
              {t("home.cateringEyebrow")}
            </p>

            <h2 className="mt-3 max-w-[700px] font-[var(--font-cormorant)] text-5xl font-bold leading-[0.95] text-[#321B29] sm:text-6xl lg:text-7xl">
              {t("home.cateringTitle")}
            </h2>
          </div>

          <div className="lg:pb-2">
            <p className="max-w-[520px] font-semibold leading-7 text-[#151313]/60">
              {t("home.cateringDescription")}
            </p>

            <Link
              href="/catering"
              className="mt-6 inline-flex rounded-xl bg-[#321B29] px-6 py-4 text-sm font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29]"
            >
              {t("home.makeCateringRequest")}
            </Link>
          </div>

        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

          {translatedOptions.map((option, index) => (
            <Link
              key={option.title}
              href="/catering"
              className={`group relative h-[350px] overflow-hidden rounded-[24px] border-b-4 shadow-[0_10px_30px_rgba(50,27,41,0.12)] ${
                index === 0
                  ? "border-[#294B73]"
                  : index === 1
                    ? "border-[#B9472E]"
                    : index === 2
                      ? "border-[#D89A27]"
                      : "border-[#2E7D5B]"
              }`}
            >
              <Image
                src={option.image}
                alt={option.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#1A0F17]/95 via-[#321B29]/35 to-black/10" />

              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-[var(--font-cormorant)] text-4xl font-bold leading-none text-white">
                  {option.title}
                </h3>

                <p className="mt-3 text-sm font-semibold leading-6 text-white/80">
                  {option.description}
                </p>
              </div>
            </Link>
          ))}

        </div>

      </div>
    </section>
  );
}
