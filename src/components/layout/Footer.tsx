"use client";

import Image from "next/image";
import Link from "next/link";

import {
  AtSign,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  db,
} from "@/lib/firebase/client";
import { useLanguage } from "@/context/LanguageContext";

type FooterSettings = {
  restaurantName: string;
  description: string;
  publicEmail: string;
  phone: string;
  instagram: string;
  address: string;
};

const defaultSettings: FooterSettings = {
  restaurantName:
    "African Restaurant Estonia",

  description:
    "Authentic Nigerian & West African food in Tallinn.",

  publicEmail:
    "africanrestaurantestonia@gmail.com",

  phone:
    "53078208",

  instagram:
    "@AFRICANRESTAURANTESTONIA",

  address:
    "NELGI 30, 11213, TALLINN",
};

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

export default function Footer() {
  const { t } = useLanguage();
  const [
    settings,
    setSettings,
  ] =
    useState<FooterSettings>(
      defaultSettings
    );

  useEffect(() => {
    const unsubscribe =
      onSnapshot(
        doc(
          db,
          "settings",
          "public"
        ),
        (snapshot) => {
          if (
            !snapshot.exists()
          ) {
            return;
          }

          const data =
            snapshot.data();

          setSettings({
            restaurantName:
              typeof data.restaurantName ===
              "string"
                ? data.restaurantName
                : defaultSettings.restaurantName,

            description:
              typeof data.description ===
              "string"
                ? data.description
                : defaultSettings.description,

            publicEmail:
              typeof data.publicEmail ===
              "string"
                ? data.publicEmail
                : defaultSettings.publicEmail,

            phone:
              typeof data.phone ===
              "string"
                ? data.phone
                : defaultSettings.phone,

            instagram:
              typeof data.instagram ===
              "string"
                ? data.instagram
                : defaultSettings.instagram,

            address:
              typeof data.address ===
              "string"
                ? data.address
                : defaultSettings.address,
          });
        },
        (error) => {
          console.error(
            "Footer settings error:",
            error
          );
        }
      );

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <footer className="border-t-4 border-[#294B73] bg-[#321B29] text-white">

      <div className="mx-auto max-w-[1312px] px-5 py-10 sm:px-8 lg:px-12 lg:py-12">

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_0.7fr_1fr]">

          {/* BRAND */}
          <div>

            <Link
              href="/#home"
              className="relative block h-[72px] w-[155px]"
            >
              <Image
                src="/images/logo/are-logo.png"
                alt={
                  settings.restaurantName
                }
                fill
                className="object-contain object-left"
                sizes="155px"
              />
            </Link>

            <h2 className="mt-5 max-w-[420px] font-[var(--font-cormorant)] text-3xl font-bold leading-tight">
              {t("hero.titleLine1")} {t("hero.titleLine2")} {t("hero.titleLine3")}
            </h2>

            <p className="mt-4 max-w-[430px] text-sm font-semibold leading-7 text-white/55">
              {settings.description}
            </p>

            <Link
              href="/menu"
              className="mt-6 inline-flex rounded-xl bg-[#D89A27] px-5 py-3 text-sm font-extrabold text-[#321B29] transition hover:bg-white"
            >
              {t("nav.startOrder")}
            </Link>

          </div>

          {/* LINKS */}
          <div>

            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#D89A27]">
              {t("nav.about")}
            </p>

            <nav className="mt-5 flex flex-col gap-3">

              {navigation.map(
                (item) => (
                  <Link
                    key={
                      item.label
                    }
                    href={
                      item.href
                    }
                    className="w-fit text-sm font-bold text-white/65 transition hover:text-[#D89A27]"
                  >
                    {t(`nav.${item.label.toLowerCase()}` as "nav.home")}
                  </Link>
                )
              )}

            </nav>

          </div>

          {/* CONTACT */}
          <div>

            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#D89A27]">
              {t("nav.contact")}
            </p>

            <div className="mt-5 space-y-4">

              <FooterContact
                icon={Mail}
                value={
                  settings.publicEmail
                }
                href={`mailto:${settings.publicEmail}`}
              />

              <FooterContact
                icon={Phone}
                value={
                  settings.phone
                }
                href={`tel:${settings.phone}`}
              />

              <FooterContact
                icon={AtSign}
                value={
                  settings.instagram
                }
              />

              <FooterContact
                icon={MapPin}
                value={
                  settings.address
                }
              />

            </div>

          </div>

        </div>

        <div className="mt-9 border-t border-white/10 pt-5">

          <div className="flex flex-col gap-4 text-xs font-semibold text-white/40 sm:flex-row sm:items-center sm:justify-between">

            <p>
              © {new Date().getFullYear()} African Restaurant Estonia. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-5">

              <Link
                href="/contact"
                className="transition hover:text-[#D89A27]"
              >
                {t("nav.contact")}
              </Link>

              <Link
                href="/privacy"
                className="transition hover:text-[#D89A27]"
              >
                Privacy Policy
              </Link>

              <Link
                href="/terms"
                className="transition hover:text-[#D89A27]"
              >
                Terms &amp; Conditions
              </Link>

            </div>

          </div>

        </div>

      </div>

    </footer>
  );
}

type FooterContactProps = {
  icon:
    React.ComponentType<{
      size?: number;
      className?: string;
    }>;

  value: string;
  href?: string;
};

function FooterContact({
  icon: Icon,
  value,
  href,
}: FooterContactProps) {
  const content = (
    <div className="flex items-start gap-3">

      <Icon
        size={17}
        className="mt-0.5 shrink-0 text-[#D89A27]"
      />

      <span className="break-words text-sm font-semibold leading-6 text-white/60">
        {value}
      </span>

    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block transition hover:text-[#D89A27]"
      >
        {content}
      </a>
    );
  }

  return content;
}
