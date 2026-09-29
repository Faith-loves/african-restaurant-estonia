"use client";

import {
  Bike,
  MessageCircle,
  ShoppingBag,
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

const BOLT_ORDER_URL =
  "https://food.bolt.eu/en/1-tallinn/p/5272570-african-restaurant-estonia/";
const WHATSAPP_NUMBER = "37253078208";
const WHATSAPP_ORDER_MESSAGE =
  "Hello African Restaurant Estonia, I would like to place an order.";

const whatsappOrderUrl =
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_ORDER_MESSAGE)}`;

export default function QuickOrderButtons() {
  const { t } = useLanguage();

  return (
    <section
      aria-label={t("home.quickOrderOptions")}
      className="bg-[#FFF8EC] px-5 pb-8 pt-3 sm:px-8 sm:pb-10 sm:pt-4 lg:px-12 lg:pb-12 lg:pt-5"
    >
      <div className="mx-auto grid max-w-[1440px] gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        <a
          href={BOLT_ORDER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-16 items-center justify-center gap-3 rounded-xl border border-[#D89A27]/45 bg-[#321B29] px-5 py-4 text-center text-base font-extrabold text-[#FFF8EC] shadow-[0_8px_20px_rgba(50,27,41,0.12)] transition hover:-translate-y-0.5 hover:border-[#D89A27] hover:bg-[#D89A27] hover:text-[#321B29] focus:outline-none focus:ring-2 focus:ring-[#D89A27] focus:ring-offset-2 focus:ring-offset-[#FFF8EC]"
        >
          <Bike size={20} aria-hidden />
          {t("home.orderOnBolt")}
        </a>

        <a
          href={whatsappOrderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-16 items-center justify-center gap-3 rounded-xl border border-[#294B73]/25 bg-white px-5 py-4 text-center text-base font-extrabold text-[#321B29] shadow-[0_8px_20px_rgba(50,27,41,0.08)] transition hover:-translate-y-0.5 hover:border-[#294B73] hover:bg-[#294B73] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#294B73] focus:ring-offset-2 focus:ring-offset-[#FFF8EC]"
        >
          <MessageCircle size={20} aria-hidden />
          {t("home.orderViaWhatsApp")}
        </a>

        <button
          type="button"
          disabled
          aria-disabled="true"
          className="inline-flex min-h-16 cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-[#321B29]/15 bg-[#321B29]/10 px-5 py-4 text-center text-base font-extrabold text-[#321B29]/45 shadow-[0_8px_20px_rgba(50,27,41,0.04)]"
        >
          <ShoppingBag size={20} aria-hidden />
          {t("home.orderOnWolt")}
        </button>
      </div>
    </section>
  );
}
