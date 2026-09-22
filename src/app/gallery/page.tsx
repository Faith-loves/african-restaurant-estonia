import type { Metadata } from "next";
import Image from "next/image";

import SiteHeader from "@/components/layout/SiteHeader";
import { menuItems } from "@/data/menuData";

export const metadata: Metadata = {
  title: "Food Gallery",
  description: "Browse the full African Restaurant Estonia food gallery.",
};

const galleryItems = menuItems.filter((item) => item.image);

export default function GalleryPage() {
  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-[#FFF8EC] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#B9472E]">
              Food & Moments
            </p>
            <h1 className="mt-3 font-[var(--font-cormorant)] text-6xl font-bold leading-none text-[#321B29] sm:text-7xl">
              Our Food Gallery
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm font-semibold leading-7 text-[#151313]/60 sm:text-base">
              Explore the dishes on our menu, from everyday favourites and
              hearty soups to proteins, snacks, drinks and complete combos.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {galleryItems.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-[22px] border border-[#321B29]/10 bg-white shadow-[0_8px_24px_rgba(50,27,41,0.08)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#321B29]/5">
                  <Image
                    src={item.image as string}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#B9472E]">
                    {item.category}
                  </p>
                  <h2 className="mt-1 font-[var(--font-cormorant)] text-2xl font-bold leading-none text-[#321B29]">
                    {item.name}
                  </h2>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
