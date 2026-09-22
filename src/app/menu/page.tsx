import { Suspense } from "react";
import type { Metadata } from "next";

import SiteHeader from "@/components/layout/SiteHeader";
import MenuSection from "@/components/menu/MenuSection";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Explore the African Restaurant Estonia menu with Nigerian and West African food in Tallinn.",
  alternates: {
    canonical: "/menu",
  },
  openGraph: {
    title: "Menu",
    description:
      "Explore the African Restaurant Estonia menu with Nigerian and West African food in Tallinn.",
    url: "https://africanrestaurant.ee/menu",
    siteName: "African Restaurant Estonia",
    locale: "en_EE",
    type: "website",
    images: [
      {
        url: "https://africanrestaurant.ee/images/hero/hero-food.png",
        width: 1672,
        height: 941,
        alt: "African Restaurant Estonia food",
      },
    ],
  },
};

function MenuLoading() {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="mx-auto max-w-[820px] text-center">
          <div className="mx-auto h-3 w-28 animate-pulse rounded-full bg-[#B9472E]/15" />
          <div className="mx-auto mt-4 h-12 w-full max-w-[480px] animate-pulse rounded-xl bg-[#321B29]/10" />
          <div className="mx-auto mt-4 h-5 w-full max-w-[580px] animate-pulse rounded-lg bg-[#321B29]/5" />
        </div>

        <div className="mx-auto mt-9 h-12 max-w-[660px] animate-pulse rounded-xl bg-[#FFF8EC]" />

        <div className="mt-8 flex gap-2 overflow-hidden">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-[#321B29]/5"
            />
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-[18px] border border-[#321B29]/10 bg-[#FFF8EC]"
            >
              <div className="h-[150px] animate-pulse bg-[#321B29]/10" />
              <div className="p-4">
                <div className="h-3 w-20 animate-pulse rounded bg-[#B9472E]/10" />
                <div className="mt-3 h-7 w-3/4 animate-pulse rounded bg-[#321B29]/10" />
                <div className="mt-3 h-4 w-full animate-pulse rounded bg-[#321B29]/5" />
                <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-[#321B29]/5" />
                <div className="mt-5 h-12 animate-pulse rounded-xl bg-[#D89A27]/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function MenuPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="bg-[#321B29] px-5 py-12 text-center text-[#FFF8EC] sm:px-8">
          <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-[#D89A27]">
            African Restaurant Estonia
          </p>

          <h1 className="mt-2 font-[var(--font-cormorant)] text-4xl font-bold sm:text-5xl md:text-6xl">
            Our Menu
          </h1>

          <p className="mx-auto mt-3 max-w-[620px] text-sm font-semibold leading-7 text-white/75">
            Browse our food, choose what is available and build your order.
          </p>
        </section>

        <Suspense fallback={<MenuLoading />}>
          <MenuSection />
        </Suspense>
      </main>
    </>
  );
}
