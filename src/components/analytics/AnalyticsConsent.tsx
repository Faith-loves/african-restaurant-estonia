"use client";

import { usePathname } from "next/navigation";
import { useAnalyticsConsent } from "@/context/AnalyticsConsentContext";

export default function AnalyticsConsent() {
  const pathname = usePathname();
  const { consent, acceptAnalytics, rejectAnalytics, resetAnalyticsConsent } = useAnalyticsConsent();

  if (pathname.startsWith("/admin")) return null;

  if (consent === "unknown") {
    return (
      <aside aria-label="Analytics consent" className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-2xl border border-[#321B29]/15 bg-white p-5 text-[#151313] shadow-[0_20px_70px_rgba(50,27,41,0.2)] sm:inset-x-6 sm:p-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#B9472E]">Privacy choices</p>
        <h2 className="mt-2 font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]">Help us improve the website</h2>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#151313]/70">With your permission, we use Google Analytics to understand anonymous website visits and improve the customer experience. Essential authentication, cart and ordering functions work either way. See our <a className="font-bold text-[#294B73] underline" href="/privacy">Privacy Policy</a>.</p>
        <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={rejectAnalytics} className="min-h-11 rounded-xl border border-[#321B29]/20 px-5 py-3 text-sm font-extrabold text-[#321B29] hover:bg-[#FFF8EC]">Reject analytics</button>
          <button type="button" onClick={acceptAnalytics} className="min-h-11 rounded-xl bg-[#321B29] px-5 py-3 text-sm font-extrabold text-white hover:bg-[#4a263b]">Accept analytics</button>
        </div>
      </aside>
    );
  }

  return <button type="button" onClick={resetAnalyticsConsent} className="fixed bottom-4 left-4 z-40 min-h-10 rounded-full border border-[#321B29]/20 bg-white px-4 py-2 text-xs font-extrabold text-[#321B29] shadow-md hover:bg-[#FFF8EC]">Privacy settings</button>;
}
