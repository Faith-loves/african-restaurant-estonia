"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ANALYTICS_CONSENT_STORAGE_KEY = "are-analytics-consent";
const CONSENT_VALUES = ["accepted", "rejected"] as const;

export type AnalyticsConsent = (typeof CONSENT_VALUES)[number] | "unknown";

type AnalyticsConsentValue = {
  consent: AnalyticsConsent;
  acceptAnalytics: () => void;
  rejectAnalytics: () => void;
  resetAnalyticsConsent: () => void;
};

const AnalyticsConsentContext = createContext<AnalyticsConsentValue | undefined>(undefined);

function readStoredConsent(): AnalyticsConsent {
  try {
    const value = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    return CONSENT_VALUES.includes(value as (typeof CONSENT_VALUES)[number]) ? (value as AnalyticsConsent) : "unknown";
  } catch {
    return "unknown";
  }
}

function storeConsent(value: Exclude<AnalyticsConsent, "unknown">) {
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, value);
  } catch {
    // Keep analytics disabled when browser storage is unavailable.
  }
}

export function AnalyticsConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<AnalyticsConsent>("unknown");

  useEffect(() => {
    queueMicrotask(() => setConsent(readStoredConsent()));
  }, []);

  const acceptAnalytics = useCallback(() => {
    storeConsent("accepted");
    setConsent("accepted");
  }, []);

  const rejectAnalytics = useCallback(() => {
    storeConsent("rejected");
    setConsent("rejected");
  }, []);

  const resetAnalyticsConsent = useCallback(() => {
    try {
      window.localStorage.removeItem(ANALYTICS_CONSENT_STORAGE_KEY);
    } catch {
      // Keep the in-memory preference unknown when storage is unavailable.
    }
    setConsent("unknown");
  }, []);

  const value = useMemo(() => ({ consent, acceptAnalytics, rejectAnalytics, resetAnalyticsConsent }), [acceptAnalytics, consent, rejectAnalytics, resetAnalyticsConsent]);
  return <AnalyticsConsentContext.Provider value={value}>{children}</AnalyticsConsentContext.Provider>;
}

export function useAnalyticsConsent() {
  const context = useContext(AnalyticsConsentContext);
  if (!context) throw new Error("useAnalyticsConsent must be used inside AnalyticsConsentProvider");
  return context;
}
