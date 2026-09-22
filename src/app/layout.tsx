import type { Metadata, Viewport } from "next";

import {
  Cormorant_Garamond,
  Manrope,
} from "next/font/google";

import "./globals.css";

import {
  CartProvider,
} from "@/context/CartContext";

import {
  AuthProvider,
} from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { GuestSessionProvider } from "@/context/GuestSessionContext";

import CartDrawer from "@/components/cart/CartDrawer";
import PublicFooter from "@/components/layout/PublicFooter";
import RestaurantJsonLd from "@/components/seo/RestaurantJsonLd";
import CustomerEntryGate from "@/components/entry/CustomerEntryGate";

const cormorant =
  Cormorant_Garamond({
    variable:
      "--font-cormorant",
    subsets: ["latin"],
    weight: [
      "400",
      "500",
      "600",
      "700",
    ],
  });

const manrope = Manrope({
  variable:
    "--font-manrope",
  subsets: ["latin"],
  weight: [
    "400",
    "500",
    "600",
    "700",
    "800",
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://africanrestaurant.ee"),
  title: {
    default: "African Restaurant Estonia",
    template: "%s | African Restaurant Estonia",
  },
  description:
    "Authentic Nigerian and West African food in Tallinn, Estonia. A taste of West Africa, right here.",
  keywords: [
    "African restaurant Tallinn",
    "Nigerian food Tallinn",
    "West African food Estonia",
    "African food Estonia",
  ],
  authors: [{ name: "African Restaurant Estonia" }],
  creator: "African Restaurant Estonia",
  publisher: "African Restaurant Estonia",
  applicationName: "African Restaurant Estonia",
  icons: {
    apple: "/icons/apple-touch-icon.png",
    icon: [
      {
        url: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "African Restaurant Estonia",
    description:
      "Authentic Nigerian and West African food in Tallinn, Estonia. A taste of West Africa, right here.",
    siteName: "African Restaurant Estonia",
    locale: "en_EE",
    type: "website",
    url: "https://africanrestaurant.ee/",
    images: [
      {
        url: "https://africanrestaurant.ee/images/hero/hero-food.png",
        width: 1672,
        height: 941,
        alt: "African Restaurant Estonia food",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "African Restaurant Estonia",
    description:
      "Authentic Nigerian and West African food in Tallinn, Estonia.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF8EC" },
    { media: "(prefers-color-scheme: dark)", color: "#321B29" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${cormorant.variable} ${manrope.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const p = localStorage.getItem('are-theme'); const d = p === 'dark' || (p !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches); document.documentElement.classList.toggle('dark', d); document.documentElement.dataset.theme = d ? 'dark' : 'light'; const path = location.pathname; const excluded = path.startsWith('/admin') || path === '/login' || path === '/signup' || path === '/account'; if (!excluded) document.documentElement.dataset.entryPending = 'true'; } catch {} })();`,
          }}
        />
        <ThemeProvider>
          <AuthProvider>

          <GuestSessionProvider>

          <CartProvider>

          <CustomerEntryGate>

          <RestaurantJsonLd />

          {children}

          <PublicFooter />

          <CartDrawer />

          </CustomerEntryGate>

          </CartProvider>

          </GuestSessionProvider>

          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
