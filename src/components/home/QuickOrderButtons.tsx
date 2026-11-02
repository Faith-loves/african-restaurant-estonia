"use client";

import {
  Bike,
  MessageCircle,
  ShoppingBag,
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

const BOLT_ORDER_URL =
  "https://food.bolt.eu/en/1-tallinn/p/5272570-african-restaurant-estonia/";
const WOLT_ORDER_URL = "https://share.google/EtX2QQKWWRWj9zB6Y";
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
      className="bg-[#FFF8EC] px-5 py-6 sm:px-8 sm:py-8 lg:px-12"
    >
      <div className="mx-auto grid max-w-5xl grid-cols-3 gap-2 rounded-2xl border border-[#D89A27]/25 bg-white/80 p-2 shadow-[0_10px_28px_rgba(50,27,41,0.08)] sm:grid-cols-2 sm:gap-3 sm:p-5 lg:grid-cols-3 lg:gap-4">
        <a
          href={whatsappOrderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-20 min-w-0 items-center justify-center gap-1 rounded-xl border border-[#294B73]/25 bg-white px-1 py-3 text-center text-xs font-extrabold leading-tight text-[#321B29] shadow-[0_8px_20px_rgba(50,27,41,0.08)] transition hover:-translate-y-0.5 hover:border-[#294B73] hover:bg-[#294B73] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#294B73] focus:ring-offset-2 focus:ring-offset-[#FFF8EC] sm:min-h-16 sm:gap-3 sm:px-5 sm:py-4 sm:text-base sm:leading-normal"
        >
          <MessageCircle size={20} aria-hidden />
          {t("home.orderViaWhatsApp")}
        </a>

        <a
          href={BOLT_ORDER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-20 min-w-0 items-center justify-center gap-1 rounded-xl border border-[#D89A27]/45 bg-[#321B29] px-1 py-3 text-center text-xs font-extrabold leading-tight text-[#FFF8EC] shadow-[0_8px_20px_rgba(50,27,41,0.12)] transition hover:-translate-y-0.5 hover:border-[#D89A27] hover:bg-[#D89A27] hover:text-[#321B29] focus:outline-none focus:ring-2 focus:ring-[#D89A27] focus:ring-offset-2 focus:ring-offset-[#FFF8EC] sm:min-h-16 sm:gap-3 sm:px-5 sm:py-4 sm:text-base sm:leading-normal"
        >
          <Bike size={20} aria-hidden />
          {t("home.orderOnBolt")}
        </a>

        <a
          href={WOLT_ORDER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-20 min-w-0 items-center justify-center gap-1 rounded-xl border border-[#294B73]/25 bg-white px-1 py-3 text-center text-xs font-extrabold leading-tight text-[#321B29] shadow-[0_8px_20px_rgba(50,27,41,0.08)] transition hover:-translate-y-0.5 hover:border-[#294B73] hover:bg-[#294B73] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#294B73] focus:ring-offset-2 focus:ring-offset-[#FFF8EC] sm:min-h-16 sm:gap-3 sm:px-5 sm:py-4 sm:text-base sm:leading-normal"
        >
          <ShoppingBag size={20} aria-hidden />
          {t("home.orderOnWolt")}
        </a>
      </div>
    </section>
  );
}
