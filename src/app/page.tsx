import type { Metadata } from "next";
import { menuItems } from "@/data/menuData";

import SiteHeader from "@/components/layout/SiteHeader";

import Hero from "@/components/home/Hero";
import QuickOrderButtons from "@/components/home/QuickOrderButtons";
import MenuHighlights from "@/components/home/MenuHighlights";
import AboutSection from "@/components/home/AboutSection";
import CateringSection from "@/components/home/CateringSection";
import ReviewsSection from "@/components/home/ReviewsSection";
import GallerySection from "@/components/home/GallerySection";
import MarketSection from "@/components/home/MarketSection";

export const metadata: Metadata = {
  title: "African Restaurant Estonia | Nigerian & West African Food in Tallinn",
  description:
    "Discover African Restaurant Estonia in Tallinn. Explore authentic Nigerian and West African dishes, browse our menu, and order delicious African food online.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "African Restaurant Estonia | Nigerian & West African Food in Tallinn",
    description:
      "Discover African Restaurant Estonia in Tallinn. Explore authentic Nigerian and West African dishes, browse our menu, and order delicious African food online.",
    url: "https://www.africanrestaurant.ee/",
    siteName: "African Restaurant Estonia",
    locale: "en_EE",
    type: "website",
    images: [
      {
        url: "https://www.africanrestaurant.ee/images/hero/hero-food.webp",
        width: 1672,
        height: 941,
        alt: "African Restaurant Estonia food",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "African Restaurant Estonia | Nigerian & West African Food in Tallinn",
    description:
      "Discover African Restaurant Estonia in Tallinn. Explore authentic Nigerian and West African dishes, browse our menu, and order delicious African food online.",
    images: [
      {
        url: "https://www.africanrestaurant.ee/images/hero/hero-food.webp",
        width: 1672,
        height: 941,
        alt: "African Restaurant Estonia food",
      },
    ],
  },
};

const comboPreviewImage = menuItems.find(
  (item) => item.category === "COMBO OPTIONS" && item.image
)?.image ?? "/images/menu-highlights/combo-options.jpg";

const galleryImages = menuItems
  .filter((item) => item.image)
  .map((item) => ({ src: item.image!, name: item.name, alt: item.name }));

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main>
        <Hero />
        <QuickOrderButtons />
        <MenuHighlights comboPreviewImage={comboPreviewImage} />
        <AboutSection />
        <CateringSection />
        <ReviewsSection />
        <GallerySection images={galleryImages} />
        <MarketSection />
      </main>
    </>
  );
}
