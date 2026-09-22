"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { GUEST_ACTIVE_STORAGE_KEY } from "@/lib/guestSessionConstants";
import { auth } from "@/lib/firebase/client";
import { signOut } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";

type GuestSessionContextValue = {
  guestActive: boolean;
  ready: boolean;
  startGuestSession: () => Promise<boolean>;
  exitGuestSession: () => Promise<void>;
};

const GuestSessionContext = createContext<GuestSessionContextValue | undefined>(undefined);

export function GuestSessionProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [guestActive, setGuestActive] = useState(false);
  const [ready, setReady] = useState(false);

  const startGuestSession = useCallback(async () => {
    try {
      if (auth.currentUser) await signOut(auth);
      const response = await fetch("/api/account/guest-session", { method: "POST" });
      if (!response.ok) return false;
      window.localStorage.setItem(GUEST_ACTIVE_STORAGE_KEY, "true");
      setGuestActive(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const exitGuestSession = useCallback(async () => {
    try {
      await fetch("/api/account/guest-session", { method: "DELETE" });
    } finally {
      window.localStorage.removeItem(GUEST_ACTIVE_STORAGE_KEY);
      setGuestActive(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;
    const active = window.localStorage.getItem(GUEST_ACTIVE_STORAGE_KEY) === "true";

    // A customer session is authoritative. Do not let a stale guest marker
    // rehydrate and sign out a customer while Firebase is settling.
    if (user) {
      window.localStorage.removeItem(GUEST_ACTIVE_STORAGE_KEY);
      queueMicrotask(() => {
        if (cancelled) return;
        setGuestActive(false);
        setReady(true);
      });

      if (active) {
        void fetch("/api/account/guest-session", { method: "DELETE" });
      }

      return () => {
        cancelled = true;
      };
    }

    if (!active) {
      queueMicrotask(() => {
        if (cancelled) return;
        setGuestActive(false);
        setReady(true);
      });
      return () => {
        cancelled = true;
      };
    }

    void (async () => {
      const started = await startGuestSession();
      if (cancelled) return;

      if (!started) {
        window.localStorage.removeItem(GUEST_ACTIVE_STORAGE_KEY);
      }

      setGuestActive(started);
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, startGuestSession, user]);

  const value = useMemo(() => ({ guestActive, ready, startGuestSession, exitGuestSession }), [exitGuestSession, guestActive, ready, startGuestSession]);
  return <GuestSessionContext.Provider value={value}>{children}</GuestSessionContext.Provider>;
}

export function useGuestSession() {
  const context = useContext(GuestSessionContext);
  if (!context) throw new Error("useGuestSession must be used inside GuestSessionProvider");
  return context;
}
