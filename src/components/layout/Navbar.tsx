"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Menu,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

import CartNavButton from "@/components/cart/CartNavButton";
import { useAuth } from "@/context/AuthContext";
import { useGuestSession } from "@/context/GuestSessionContext";

const navigation = [
  {
    label: "Home",
    href: "/#home",
  },
  {
    label: "Menu",
    href: "/menu",
  },
  {
    label: "About",
    href: "/#about",
  },
  {
    label: "Catering",
    href: "/catering",
  },
  {
    label: "Contact",
    href: "/contact",
  },
  {
    label: "Market",
    href: "/market",
  },
];

export default function Navbar() {
  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const {
    user,
    loading: authLoading,
    logout,
  } = useAuth();
  const { guestActive, ready: guestReady, exitGuestSession } = useGuestSession();

  const customerName =
    user?.displayName?.split(" ")[0] || "Account";

  return (
    <nav className="are-navbar border-b border-[#321B29]/10 bg-white shadow-[0_2px_12px_rgba(50,27,41,0.04)]">

      <div className="mx-auto flex h-[82px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">

        <Link
          href="/#home"
          className="relative block h-[56px] w-[120px] shrink-0"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        >
          <Image
            src="/images/logo/are-logo.png"
            alt="African Restaurant Estonia"
            fill
            priority
            className="object-contain object-left"
            sizes="120px"
          />
        </Link>

        <div className="hidden items-center gap-7 lg:flex">

          {navigation.map(
            (item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-bold text-[#321B29]/75 transition hover:text-[#B9472E]"
              >
                {item.label}
              </Link>
            )
          )}

        </div>

        <div className="hidden items-center gap-3 lg:flex">

          <CartNavButton />

          {!authLoading && guestReady && (
            guestActive ? (
              <div className="flex items-center gap-2">
                <Link href="/account" className="rounded-lg border border-[#294B73]/30 px-4 py-3 text-sm font-extrabold text-[#294B73] transition hover:border-[#294B73] hover:bg-[#294B73] hover:text-white">Account</Link>
                <button type="button" onClick={() => { if (window.confirm("Exit this guest session? You may lose access to its order history on this device.")) void exitGuestSession(); }} className="rounded-lg border border-[#294B73]/30 px-4 py-3 text-sm font-extrabold text-[#294B73] transition hover:border-[#294B73] hover:bg-[#294B73] hover:text-white">Exit Guest</button>
              </div>
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link href="/account" className="rounded-lg border border-[#294B73]/30 px-4 py-3 text-sm font-extrabold text-[#294B73] transition hover:border-[#294B73] hover:bg-[#294B73] hover:text-white">Account</Link>
                <button type="button" onClick={() => void logout()} className="rounded-lg border border-[#294B73]/30 px-4 py-3 text-sm font-extrabold text-[#294B73] transition hover:border-[#294B73] hover:bg-[#294B73] hover:text-white">Log out ({customerName})</button>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-lg border border-[#294B73]/30 px-4 py-3 text-sm font-extrabold text-[#294B73] transition hover:border-[#294B73] hover:bg-[#294B73] hover:text-white"
              >
                Login
              </Link>
            )
          )}

          <Link
            href="/menu"
            className="are-start-order rounded-lg bg-[#321B29] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29]"
          >
            Start Order
          </Link>

        </div>

        <div className="flex items-center gap-2 lg:hidden">

          <CartNavButton />

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                (current) =>
                  !current
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#321B29]/15 bg-[#FFF8EC] text-[#321B29] transition hover:border-[#D89A27]"
            aria-label={
              mobileMenuOpen
                ? "Close menu"
                : "Open menu"
            }
          >
            {mobileMenuOpen ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>

        </div>

      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[#321B29]/10 bg-white px-5 pb-6 pt-3 lg:hidden">

          <div className="flex flex-col">

            {navigation.map(
              (item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                  className="border-b border-[#321B29]/10 py-4 text-sm font-bold text-[#321B29]/80 transition hover:text-[#B9472E]"
                >
                  {item.label}
                </Link>
              )
            )}

          </div>

          <Link
            href="/menu"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="are-start-order mt-5 flex w-full items-center justify-center rounded-xl bg-[#321B29] px-5 py-4 text-sm font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29]"
          >
            Start Order
          </Link>

          {!authLoading && guestReady && (
            guestActive ? (
              <div className="mt-3 grid gap-3">
                <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 w-full items-center justify-center rounded-xl border border-[#294B73]/30 px-5 py-3 text-sm font-extrabold text-[#294B73]">Account</Link>
                <button type="button" onClick={() => { if (window.confirm("Exit this guest session? You may lose access to its order history on this device.")) { setMobileMenuOpen(false); void exitGuestSession(); } }} className="flex min-h-11 w-full items-center justify-center rounded-xl border border-[#294B73]/30 px-5 py-3 text-sm font-extrabold text-[#294B73]">Exit Guest Session</button>
              </div>
            ) : user ? (
              <div className="mt-3 grid gap-3">
                <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 w-full items-center justify-center rounded-xl border border-[#294B73]/30 px-5 py-3 text-sm font-extrabold text-[#294B73]">Account</Link>
                <button type="button" onClick={() => { setMobileMenuOpen(false); void logout(); }} className="flex min-h-11 w-full items-center justify-center rounded-xl border border-[#294B73]/30 px-5 py-3 text-sm font-extrabold text-[#294B73]">Log out ({customerName})</button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl border border-[#294B73]/30 px-5 py-3 text-sm font-extrabold text-[#294B73]"
              >
                Sign In
              </Link>
            )
          )}

        </div>
      )}

    </nav>
  );
}
