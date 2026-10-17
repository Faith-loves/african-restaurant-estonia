"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { useAnalyticsConsent } from "@/context/AnalyticsConsentContext";
import {
  configureGoogleAnalytics,
  disableGoogleAnalytics,
  isAnalyticsEnabled,
  measurementId,
  trackAnalyticsEvent,
} from "@/lib/analytics/ga4";

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const { consent } = useAnalyticsConsent();
  const lastPageRef = useRef<string | null>(null);
  const enabled = Boolean(measurementId && consent === "accepted" && isAnalyticsEnabled() && !pathname.startsWith("/admin"));

  useEffect(() => {
    if (!enabled) {
      lastPageRef.current = null;
      disableGoogleAnalytics();
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !measurementId) return;
    configureGoogleAnalytics();
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !measurementId) return;
    if (lastPageRef.current === pathname) return;
    lastPageRef.current = pathname;
    trackAnalyticsEvent("page_view", {
      page_title: document.title,
      page_location: `${window.location.origin}${pathname}`,
      page_path: pathname,
    });
  }, [enabled, pathname]);

  if (!enabled || !measurementId) return null;
  return <Script id="ga4-loader" src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />;
}
