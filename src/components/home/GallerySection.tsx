"use client";

import Image from "next/image";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

const galleryImages = [
  {
    src: "/images/hero/hero-food.png",
    alt: "African Restaurant Estonia food",
  },
  {
    src: "/images/menu-highlights/todays-menu.png",
    alt: "Today's Menu",
  },
  {
    src: "/images/menu-highlights/chef-special.png",
    alt: "Chef's Special",
  },
  {
    src: "/images/menu-highlights/vegan-options.png",
    alt: "West African food",
  },
  {
    src: "/images/menu-highlights/combo-options.png",
    alt: "African food combo",
  },
];

export default function GallerySection() {
  const [
    rotation,
    setRotation,
  ] = useState(0);

  useEffect(() => {
    const interval =
      window.setInterval(
        () => {
          setRotation(
            (current) =>
              (current + 1) %
              galleryImages.length
          );
        },
        60000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, []);

  const visibleImages =
    useMemo(() => {
      return [
        ...galleryImages.slice(
          rotation
        ),
        ...galleryImages.slice(
          0,
          rotation
        ),
      ];
    }, [rotation]);

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

            <p className="max-w-[550px] text-sm font-semibold leading-7 text-[#151313]/55">
              From everyday favourites to catering and special occasions, explore a glimpse of the food and experiences from African Restaurant Estonia.
            </p>

          </div>

        </div>

        <div className="mt-12 grid auto-rows-[210px] grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">

          {visibleImages.map(
            (
              image,
              index
            ) => {
              const isFeatured =
                index === 0;

              return (
                <div
                  key={`${image.src}-${rotation}-${index}`}
                  className={`group relative overflow-hidden rounded-[24px] bg-[#321B29]/5 ${
                    isFeatured
                      ? "md:col-span-2 md:row-span-2"
                      : ""
                  }`}
                >

                  <Image
                    src={
                      image.src
                    }
                    alt={
                      image.alt
                    }
                    fill
                    priority={
                      isFeatured
                    }
                    sizes={
                      isFeatured
                        ? "(max-width: 768px) 100vw, 50vw"
                        : "(max-width: 768px) 50vw, 25vw"
                    }
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#321B29]/45 via-transparent to-transparent opacity-70 transition group-hover:opacity-40" />

                </div>
              );
            }
          )}

        </div>

      </div>
    </section>
  );
}
