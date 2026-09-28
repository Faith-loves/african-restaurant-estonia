"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { db } from "@/lib/firebase/client";

export type PublicSettings = {
  restaurantName: string;
  tagline: string;
  description: string;
  publicEmail: string;
  phone: string;
  instagram: string;
  address: string;
};

export const defaultPublicSettings: PublicSettings = {
  restaurantName: "African Restaurant Estonia",
  tagline: "A Taste of West Africa, Right Here.",
  description: "Authentic Nigerian & West African food in Tallinn.",
  publicEmail: "africanrestaurantestonia@gmail.com",
  phone: "53078208",
  instagram: "@AFRICANRESTAURANTESTONIA",
  address: "NELGI 30, 11213, TALLINN",
};

const PublicSettingsContext = createContext<PublicSettings>(defaultPublicSettings);

export function PublicSettingsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [settings, setSettings] = useState(defaultPublicSettings);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    return onSnapshot(doc(db, "settings", "public"), (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      setSettings({
        restaurantName: typeof data.restaurantName === "string" ? data.restaurantName : defaultPublicSettings.restaurantName,
        tagline: typeof data.tagline === "string" ? data.tagline : defaultPublicSettings.tagline,
        description: typeof data.description === "string" ? data.description : defaultPublicSettings.description,
        publicEmail: typeof data.publicEmail === "string" ? data.publicEmail : defaultPublicSettings.publicEmail,
        phone: typeof data.phone === "string" ? data.phone : defaultPublicSettings.phone,
        instagram: typeof data.instagram === "string" ? data.instagram : defaultPublicSettings.instagram,
        address: typeof data.address === "string" ? data.address : defaultPublicSettings.address,
      });
    }, (error) => console.error("Public settings error:", error));
  }, [pathname]);

  const value = useMemo(() => settings, [settings]);
  return <PublicSettingsContext.Provider value={value}>{children}</PublicSettingsContext.Provider>;
}

export function usePublicSettings() {
  return useContext(PublicSettingsContext);
}
