"use client";

import { Download, Share, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useLanguage } from "@/context/LanguageContext";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches
    || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function InstallBanner() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const repeatTimer = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [installPromptAvailable, setInstallPromptAvailable] = useState(false);
  const [ios, setIos] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    let mounted = true;
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const eligible = mobileQuery.matches || /iphone|ipad|ipod/i.test(window.navigator.userAgent);

    queueMicrotask(() => {
      if (!mounted) return;
      setMobile(eligible && !isStandalone());
      setIos(eligible && isIos() && !isStandalone());
    });

    if (!eligible || isStandalone()) return;

    const showLater = (delay: number) => {
      if (repeatTimer.current) window.clearTimeout(repeatTimer.current);
      repeatTimer.current = window.setTimeout(() => {
        if (mounted && !isStandalone()) setVisible(true);
      }, delay);
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      deferredPrompt.current = event as BeforeInstallPromptEvent;
      setInstallPromptAvailable(true);
    };

    const handleAppInstalled = () => {
      deferredPrompt.current = null;
      setInstallPromptAvailable(false);
      setVisible(false);
      if (repeatTimer.current) window.clearTimeout(repeatTimer.current);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    showLater(7000);

    return () => {
      mounted = false;
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      if (repeatTimer.current) window.clearTimeout(repeatTimer.current);
    };
  }, []);

  if (pathname.startsWith("/admin") || !mobile || !visible) return null;

  async function install() {
    if (!deferredPrompt.current) return;

    await deferredPrompt.current.prompt();
    const choice = await deferredPrompt.current.userChoice;
    deferredPrompt.current = null;
    setInstallPromptAvailable(false);
    setVisible(false);

    if (choice.outcome === "dismissed") {
      if (repeatTimer.current) window.clearTimeout(repeatTimer.current);
      repeatTimer.current = window.setTimeout(() => setVisible(true), 10000);
    }
  }

  function dismiss() {
    setVisible(false);
    if (repeatTimer.current) window.clearTimeout(repeatTimer.current);
    repeatTimer.current = window.setTimeout(() => {
      if (!isStandalone()) setVisible(true);
    }, 10000);
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed left-3 right-3 top-[122px] z-40 mx-auto max-w-md rounded-2xl border border-[#D89A27]/35 bg-[#321B29] p-4 text-[#FFF8EC] shadow-[0_18px_45px_rgba(21,19,19,0.28)] motion-safe:animate-[entry-writing_350ms_ease-out] sm:left-auto sm:right-5 sm:w-[390px]"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D89A27] text-[#321B29]">
          {ios ? <Share size={19} aria-hidden /> : <Download size={19} aria-hidden />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold leading-5">{ios ? t("install.title") : t("install.title")}</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-[#FFF8EC]/70">
            {ios ? t("install.iosDescription") : t("install.description")}
          </p>
          <div className="mt-3 flex items-center gap-2">
            {!ios && installPromptAvailable && (
              <button type="button" onClick={() => void install()} className="min-h-10 rounded-lg bg-[#D89A27] px-4 py-2 text-xs font-extrabold text-[#321B29] transition hover:bg-[#FFF8EC] focus:outline-none focus:ring-2 focus:ring-[#FFF8EC] focus:ring-offset-2 focus:ring-offset-[#321B29]">
                {t("install.install")}
              </button>
            )}
            {ios && <span className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#FFF8EC]/20 px-3 py-2 text-xs font-bold"><Share size={14} aria-hidden />{t("install.iosAction")}</span>}
            <button type="button" onClick={dismiss} className="min-h-10 rounded-lg px-3 py-2 text-xs font-bold text-[#FFF8EC]/75 transition hover:bg-[#FFF8EC]/10 hover:text-[#FFF8EC] focus:outline-none focus:ring-2 focus:ring-[#D89A27]">
              {ios ? t("install.notNow") : t("install.notNow")}
            </button>
          </div>
        </div>
        <button type="button" onClick={dismiss} aria-label={t("install.close")} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#FFF8EC]/60 transition hover:bg-[#FFF8EC]/10 hover:text-[#FFF8EC] focus:outline-none focus:ring-2 focus:ring-[#D89A27]"><X size={17} aria-hidden /></button>
      </div>
    </aside>
  );
}
