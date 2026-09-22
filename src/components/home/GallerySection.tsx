"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { menuItems } from "@/data/menuData";

const galleryImages = menuItems
  .filter((item) => item.image)
  .map((item) => ({
    src: item.image as string,
    alt: item.name,
    name: item.name,
  }));

const GALLERY_SIZE = 5;

export default function GallerySection() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRotation((current) => (current + GALLERY_SIZE) % galleryImages.length);
    }, 60000);

    return () => window.clearInterval(interval);
  }, []);

  const visibleImages = useMemo(
    () =>
      Array.from({ length: GALLERY_SIZE }, (_, index) =>
        galleryImages[(rotation + index) % galleryImages.length]
      ),
    [rotation]
  );

  return (
    <section
      id="gallery"
      className="bg-[#FFF8EC] px-5 py-20 sm:px-8 lg:px-12 lg:py-24"
    >
      <div className="mx-auto max-w-[1312px]">
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#B9472E]">
              Food & Moments
            </p>

            <h2 className="mt-3 font-[var(--font-cormorant)] text-5xl font-bold leading-[0.95] text-[#321B29] sm:text-6xl lg:text-7xl">
              A Little Taste Before You Order.
            </h2>
          </div>

          <div className="lg:flex lg:justify-end lg:pb-2">
            <div className="max-w-[550px]">
              <p className="text-sm font-semibold leading-7 text-[#151313]/55">
              A changing selection from our menu. Explore the full collection
              and find your next favourite on the menu page.
              </p>

              <Link
                href="/gallery"
                className="mt-5 inline-flex items-center rounded-lg bg-[#321B29] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29]"
              >
                View Full Gallery
              </Link>
            </div>
          </div>
        </div>

        <div
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:h-[560px] lg:grid-cols-[1.1fr_1fr_1fr] lg:grid-rows-2"
          aria-live="polite"
        >
          {visibleImages.map((image, index) => (
            <div
              key={`${image.src}-${rotation}`}
              className={`group relative aspect-[4/3] overflow-hidden rounded-[24px] bg-[#321B29]/5 lg:aspect-auto ${
                index === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={
                  index === 0
                    ? "(max-width: 1024px) 100vw, 55vw"
                    : "(max-width: 1024px) 50vw, 27vw"
                }
                className="object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#321B29]/80 via-[#321B29]/5 to-transparent" />

              <p className="absolute inset-x-5 bottom-5 font-[var(--font-cormorant)] text-3xl font-bold text-white">
                {image.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
