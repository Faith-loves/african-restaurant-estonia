import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";

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
        url: "https://africanrestaurant.ee/images/hero/menu-food.jpg",
        width: 1000,
        height: 667,
        alt: "African Restaurant Estonia menu",
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
        <section className="relative isolate flex min-h-[480px] items-center justify-center overflow-hidden px-5 py-20 text-[#FFF8EC] sm:px-8 lg:px-12 lg:py-28">
          <Image
            src="/images/hero/menu-food.jpg"
            alt="A selection of food ready to explore on the menu"
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-[#321B29]/80" />

          <div className="relative z-10 mx-auto max-w-[820px] text-center">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-[#D89A27]">
                African Restaurant Estonia
              </p>

              <h1 className="mt-4 font-[var(--font-cormorant)] text-6xl font-bold leading-none sm:text-7xl lg:text-8xl">
                Our Menu
              </h1>

              <p className="mx-auto mt-6 max-w-[680px] text-base font-semibold leading-8 text-white/95 sm:text-lg">
                Browse our menu and discover the tasty and memorable flavours of
                Africa. From diverse rice dishes and hearty soups to traditional
                meals like egusi, afang and ewedu, with a variety of fufu, grilled
                proteins, snacks and refreshing drinks, we bring the flavours of
                Africa to your table.
              </p>

              <p className="mx-auto mt-4 max-w-[620px] text-sm font-medium leading-7 text-white/80">
                Choose your favourite dishes, check what is available, and
                build an order made just for you.
              </p>
            </div>

          </div>
        </section>

        <Suspense fallback={<MenuLoading />}>
          <MenuSection />
        </Suspense>
      </main>
    </>
  );
}
