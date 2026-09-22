import type { Metadata } from "next";

import SiteHeader from "@/components/layout/SiteHeader";

import Hero from "@/components/home/Hero";
import MenuHighlights from "@/components/home/MenuHighlights";
import AboutSection from "@/components/home/AboutSection";
import CateringSection from "@/components/home/CateringSection";
import ReviewsSection from "@/components/home/ReviewsSection";
import GallerySection from "@/components/home/GallerySection";
import MarketSection from "@/components/home/MarketSection";

export const metadata: Metadata = {
  title: "Nigerian & West African Food in Tallinn",
  description:
    "African Restaurant Estonia serves authentic Nigerian and West African food in Tallinn. A taste of West Africa, right here.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Nigerian & West African Food in Tallinn",
    description:
      "African Restaurant Estonia serves authentic Nigerian and West African food in Tallinn. A taste of West Africa, right here.",
    url: "https://africanrestaurant.ee/",
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

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main>
        <Hero />
        <MenuHighlights />
        <AboutSection />
        <CateringSection />
        <ReviewsSection />
        <GallerySection />
        <MarketSection />
      </main>
    </>
  );
}
