"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import CartNavButton from "@/components/cart/CartNavButton";
import LanguageSelector from "@/components/layout/LanguageSelector";
import { useAuth } from "@/context/AuthContext";
import { useGuestSession } from "@/context/GuestSessionContext";
import { useLanguage } from "@/context/LanguageContext";

const navigation = [
  ["home", "/#home"],
  ["menu", "/menu"],
  ["about", "/#about"],
  ["catering", "/catering"],
  ["contact", "/contact"],
  ["market", "/market"],
] as const;

export default function Navbar() {
  const router = useRouter();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading: authLoading, logout } = useAuth();
  const { guestActive, ready: guestReady, exitGuestSession } = useGuestSession();
  const customerName = user?.displayName?.split(" ")[0] || "Account";

  async function handleExitGuest() {
    setMobileMenuOpen(false);
    await exitGuestSession();
    router.replace("/");
  }

  function renderNavigation() {
    return navigation.map(([key, href]) => (
      <Link key={key} href={href} onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-[#321B29]/75 transition hover:text-[#B9472E] focus:outline-none focus:ring-2 focus:ring-[#D89A27]">
        {t(`nav.${key}` as "nav.home")}
      </Link>
    ));
  }

  function customerActions(mobile = false) {
    if (authLoading || !guestReady) return null;
    const shared = mobile ? "flex min-h-11 w-full items-center justify-center rounded-xl" : "rounded-lg";
    if (guestActive) return <div className={mobile ? "mt-3 grid gap-3" : "flex items-center gap-2"}><Link href="/account" onClick={() => setMobileMenuOpen(false)} className={`${shared} border border-[#294B73]/30 px-4 py-3 text-sm font-extrabold text-[#294B73]`}>{t("nav.account")}</Link><button type="button" onClick={() => { if (window.confirm("Exit this guest session? You may lose access to its order history on this device.")) void handleExitGuest(); }} className={`${shared} border border-[#294B73]/30 px-4 py-3 text-sm font-extrabold text-[#294B73]`}>{mobile ? t("nav.exitGuestSession") : t("nav.exitGuest")}</button></div>;
    if (user) return <div className={mobile ? "mt-3 grid gap-3" : "flex items-center gap-2"}><Link href="/account" onClick={() => setMobileMenuOpen(false)} className={`${shared} border border-[#294B73]/30 px-4 py-3 text-sm font-extrabold text-[#294B73]`}>{t("nav.account")}</Link><button type="button" onClick={() => { setMobileMenuOpen(false); void logout(); }} className={`${shared} border border-[#294B73]/30 px-4 py-3 text-sm font-extrabold text-[#294B73]`}>{t("nav.logout")} ({customerName})</button></div>;
    return <Link href="/login" onClick={() => setMobileMenuOpen(false)} className={`${mobile ? "mt-3 flex min-h-11 w-full items-center justify-center rounded-xl" : "rounded-lg"} border border-[#294B73]/30 px-4 py-3 text-sm font-extrabold text-[#294B73]`}>{mobile ? t("nav.signIn") : t("nav.login")}</Link>;
  }

  return (
    <nav className="are-navbar border-b border-[#321B29]/10 bg-white shadow-[0_2px_12px_rgba(50,27,41,0.04)]">
      <div className="mx-auto flex h-[82px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/#home" className="relative block h-[56px] w-[120px] shrink-0" onClick={() => setMobileMenuOpen(false)}><Image src="/images/logo/are-logo.png" alt="African Restaurant Estonia" fill priority className="object-contain object-left" sizes="120px" /></Link>
        <div className="hidden items-center gap-7 lg:flex">{renderNavigation()}</div>
        <div className="hidden items-center gap-3 lg:flex"><CartNavButton /><LanguageSelector />{customerActions()}<Link href="/menu" className="are-start-order rounded-lg bg-[#321B29] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29] focus:outline-none focus:ring-2 focus:ring-[#D89A27]">{t("nav.startOrder")}</Link></div>
        <div className="flex items-center gap-2 lg:hidden"><CartNavButton /><LanguageSelector /><button type="button" onClick={() => setMobileMenuOpen((current) => !current)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#321B29]/15 bg-[#FFF8EC] text-[#321B29] transition hover:border-[#D89A27] focus:outline-none focus:ring-2 focus:ring-[#D89A27]" aria-label={mobileMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}>{mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
      </div>
      {mobileMenuOpen && <div className="border-t border-[#321B29]/10 bg-white px-5 pb-6 pt-3 lg:hidden"><div className="flex flex-col gap-5">{renderNavigation()}</div><Link href="/menu" onClick={() => setMobileMenuOpen(false)} className="are-start-order mt-5 flex w-full items-center justify-center rounded-xl bg-[#321B29] px-5 py-4 text-sm font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29] focus:outline-none focus:ring-2 focus:ring-[#D89A27]">{t("nav.startOrder")}</Link>{customerActions(true)}</div>}
    </nav>
  );
}
