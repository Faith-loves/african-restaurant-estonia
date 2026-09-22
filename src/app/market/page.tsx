import type { Metadata } from "next";

import SiteHeader from "@/components/layout/SiteHeader";
import MarketSection from "@/components/home/MarketSection";

export const metadata: Metadata = {
  title: "Market",
  description:
    "Discover African food ingredients and market information from African Restaurant Estonia in Tallinn.",
  alternates: {
    canonical: "/market",
  },
  openGraph: {
    title: "Market",
    description:
      "Discover African food ingredients and market information from African Restaurant Estonia in Tallinn.",
    url: "https://africanrestaurant.ee/market",
    siteName: "African Restaurant Estonia",
    locale: "en_EE",
    type: "website",
    images: [
      {
        url: "https://africanrestaurant.ee/images/menu-highlights/chef-special.png",
        width: 1536,
        height: 1024,
        alt: "African food from African Restaurant Estonia",
      },
    ],
  },
};

export default function MarketPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <MarketSection />
      </main>
    </>
  );
}
