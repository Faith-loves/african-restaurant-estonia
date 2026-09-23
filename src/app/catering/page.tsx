import type { Metadata } from "next";

import SiteHeader from "@/components/layout/SiteHeader";
import CateringRequestForm from "@/components/catering/CateringRequestForm";

export const metadata: Metadata = {
  title: "Catering & Special Orders",
  description:
    "Request catering, event meals, corporate food, or West African food gift boxes from African Restaurant Estonia in Tallinn.",
  alternates: {
    canonical: "/catering",
  },
  openGraph: {
    title: "Catering & Special Orders",
    description:
      "Request catering, event meals, corporate food, or West African food gift boxes from African Restaurant Estonia in Tallinn.",
    url: "https://africanrestaurant.ee/catering",
    siteName: "African Restaurant Estonia",
    locale: "en_EE",
    type: "website",
    images: [
      {
        url: "https://africanrestaurant.ee/images/catering/event-catering.jpg",
        width: 1448,
        height: 1086,
        alt: "African Restaurant Estonia catering",
      },
    ],
  },
};

export default function CateringPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="bg-[#321B29] px-5 py-14 text-center text-[#FFF8EC] sm:px-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#D89A27]">
            African Restaurant Estonia
          </p>

          <h1 className="mt-2 font-[var(--font-cormorant)] text-4xl font-bold sm:text-5xl md:text-6xl">
            Catering & Special Orders
          </h1>

          <p className="mx-auto mt-4 max-w-[650px] font-semibold leading-7 text-white/70">
            Corporate meals, private events and thoughtful food gift boxes prepared with authentic West African flavour.
          </p>
        </section>

        <CateringRequestForm />
      </main>
    </>
  );
}
