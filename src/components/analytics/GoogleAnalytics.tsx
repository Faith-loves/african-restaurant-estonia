"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { useAnalyticsConsent } from "@/context/AnalyticsConsentContext";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function isProductionSite() {
  if (process.env.NODE_ENV !== "production" || typeof window === "undefined") return false;
  return window.location.hostname === "africanrestaurant.ee" || window.location.hostname === "www.africanrestaurant.ee";
}

function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || ((...args: unknown[]) => window.dataLayer?.push(args));
  return window.gtag;
}

function disableGoogleAnalytics() {
  if (!measurementId || typeof window === "undefined") return;
  (window as unknown as Record<string, boolean>)[`ga-disable-${measurementId}`] = true;
}

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const { consent } = useAnalyticsConsent();
  const lastPageRef = useRef<string | null>(null);
  const enabled = Boolean(measurementId && consent === "accepted" && isProductionSite() && !pathname.startsWith("/admin"));

  useEffect(() => {
    if (!enabled) {
      lastPageRef.current = null;
      disableGoogleAnalytics();
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !measurementId) return;
    (window as unknown as Record<string, boolean>)[`ga-disable-${measurementId}`] = false;
    const gtag = ensureGtag();
    gtag("js", new Date());
    gtag("config", measurementId, { send_page_view: false });
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !measurementId) return;
    if (lastPageRef.current === pathname) return;
    lastPageRef.current = pathname;
    ensureGtag()("event", "page_view", {
      page_title: document.title,
      page_location: `${window.location.origin}${pathname}`,
      page_path: pathname,
    });
  }, [enabled, pathname]);

  if (!enabled || !measurementId) return null;
  return <Script id="ga4-loader" src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />;
}
