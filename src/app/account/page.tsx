import type { Metadata } from "next";

import SiteHeader from "@/components/layout/SiteHeader";
import AccountPage from "@/components/account/AccountPage";

export const metadata: Metadata = {
  title: "Customer Account",
  robots: { index: false, follow: false },
};

export default function AccountRoute() {
  return <><SiteHeader /><main><AccountPage /></main></>;
}
