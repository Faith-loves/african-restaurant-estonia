import type { Metadata } from "next";

import SiteHeader from "@/components/layout/SiteHeader";
import ContactPage from "@/components/contact/ContactPage";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact African Restaurant Estonia in Tallinn about Nigerian and West African food, orders, and enquiries.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact",
    description:
      "Contact African Restaurant Estonia in Tallinn about Nigerian and West African food, orders, and enquiries.",
    url: "https://africanrestaurant.ee/contact",
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

export default function Contact() {
  return (
    <>
      <SiteHeader />
      <ContactPage />
    </>
  );
}
