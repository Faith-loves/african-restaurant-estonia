import type { Metadata } from "next";
import Image from "next/image";

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
        url: "https://africanrestaurant.ee/images/catering/catering.jpg",
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
        <section className="relative isolate overflow-hidden px-5 py-20 text-center text-[#FFF8EC] sm:px-8 sm:py-28">
          <Image
            src="/images/catering/catering.jpg"
            alt="West African catering dishes prepared for an event"
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover object-center"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#321B29]/95 via-[#321B29]/80 to-[#321B29]/65" />

          <p className="relative z-10 text-xs font-extrabold uppercase tracking-[0.22em] text-[#D89A27]">
            African Restaurant Estonia
          </p>

          <h1 className="relative z-10 mt-2 font-[var(--font-cormorant)] text-4xl font-bold sm:text-5xl md:text-6xl">
            Catering & Special Orders
          </h1>

          <p className="relative z-10 mx-auto mt-4 max-w-[650px] font-semibold leading-7 text-white/85">
            Corporate meals, private events and thoughtful food gift boxes prepared with authentic West African flavour.
          </p>
        </section>

        <CateringRequestForm />
      </main>
    </>
  );
}
