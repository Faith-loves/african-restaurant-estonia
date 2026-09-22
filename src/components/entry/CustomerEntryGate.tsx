"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGuestSession } from "@/context/GuestSessionContext";

function clearPendingEntryMarker() {
  document.documentElement.removeAttribute("data-entry-pending");
}

function isExcludedPath(pathname: string) {
  return pathname.startsWith("/admin") || pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password" || pathname === "/account";
}

export default function CustomerEntryGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { guestActive, ready: guestReady, startGuestSession } = useGuestSession();

  const [stage, setStage] = useState<"checking" | "splash" | "choice" | "done">("checking");
  const [guestStarting, setGuestStarting] = useState(false);
  const [guestError, setGuestError] = useState("");

  useEffect(() => {
    if (isExcludedPath(pathname)) {
      clearPendingEntryMarker();
      queueMicrotask(() => setStage("done"));
      return;
    }

    if (authLoading || !guestReady) {
      return;
    }

    if (user || guestActive) {
      clearPendingEntryMarker();
      queueMicrotask(() => setStage("done"));
      return;
    }

    queueMicrotask(() => setStage((current) => current === "checking" ? "splash" : current));

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      setStage((current) => current === "splash" ? "choice" : current);
    }, reducedMotion ? 100 : 1800);

    return () => window.clearTimeout(timer);
  }, [pathname, authLoading, guestReady, user, guestActive]);

  async function continueAsGuest() {
    setGuestStarting(true);
    setGuestError("");

    try {
      const started = await startGuestSession();

      if (!started) {
        setGuestError("Guest access could not be started. Please try again.");
        return;
      }

      clearPendingEntryMarker();
      queueMicrotask(() => setStage("done"));
    } finally {
      setGuestStarting(false);
    }
  }

  if (isExcludedPath(pathname)) {
    return <>{children}</>;
  }

  if (authLoading || !guestReady) {
    return null;
  }

  if (user || guestActive || stage === "done") {
    return <>{children}</>;
  }

  return (
    <div className="entry-gate-shell fixed inset-0 z-[100] overflow-y-auto bg-[#151313] text-[#FFF8EC]">
      <Image
        src="/images/hero/splash-buffet.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-[#151313]/75" />

      <div className="relative flex min-h-screen items-center justify-center px-5 py-12 text-center sm:px-8">
        {stage === "splash" || stage === "checking" ? (
          <div className="max-w-xl">
            <div className="mx-auto mb-7 h-20 w-20 overflow-hidden rounded-full border border-[#D89A27]/40 bg-[#FFF8EC] p-3 shadow-2xl">
              <Image
                src="/images/logo/are-logo.png"
                alt="African Restaurant Estonia"
                width={80}
                height={80}
                className="h-full w-full object-contain"
              />
            </div>

            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#D89A27]">
              African Restaurant Estonia
            </p>

            <h1 className="mt-4 font-[var(--font-cormorant)] text-5xl font-bold leading-none sm:text-7xl">
              A Taste of West Africa, Right Here.
            </h1>

            <p className="entry-writing mt-5 text-sm font-semibold text-[#FFF8EC]/75">
              Fresh flavours are on the way...
            </p>
          </div>
        ) : (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="entry-choice-title"
            className="w-full max-w-md rounded-[28px] border border-white/15 bg-[#321B29]/90 p-7 shadow-2xl backdrop-blur sm:p-9"
          >
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#D89A27]">
              Welcome
            </p>

            <h1
              id="entry-choice-title"
              className="mt-3 font-[var(--font-cormorant)] text-5xl font-bold leading-none"
            >
              How would you like to continue?
            </h1>

            <p className="mt-4 text-sm font-semibold leading-6 text-[#FFF8EC]/70">
              Sign in or create an account for a smoother experience, or continue as a guest to browse and order.
            </p>

            <div className="mt-7 grid gap-3">
              <Link
                href="/login"
                onClick={clearPendingEntryMarker}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#D89A27] px-5 py-3 text-sm font-extrabold text-[#321B29] transition hover:bg-[#FFF8EC]"
              >
                Sign In
              </Link>

              <Link
                href="/signup"
                onClick={clearPendingEntryMarker}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#D89A27]/60 px-5 py-3 text-sm font-extrabold text-[#FFF8EC] transition hover:bg-[#D89A27] hover:text-[#321B29]"
              >
                Create Account
              </Link>

              <button
                type="button"
                onClick={() => void continueAsGuest()}
                disabled={guestStarting}
                className="min-h-12 rounded-xl border border-white/20 px-5 py-3 text-sm font-extrabold text-[#FFF8EC]/80 transition hover:border-white hover:text-white disabled:cursor-wait disabled:opacity-60"
              >
                {guestStarting ? "Starting Guest Session..." : "Continue as Guest"}
              </button>

              {guestError && (
                <p role="alert" className="text-sm font-bold text-[#ffcfbf]">
                  {guestError}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


