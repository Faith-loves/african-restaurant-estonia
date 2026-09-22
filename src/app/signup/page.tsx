import type { Metadata } from "next";

import SiteHeader from "@/components/layout/SiteHeader";
import CustomerAuthForm from "@/components/auth/CustomerAuthForm";

export const metadata: Metadata = {
  title: "Create a Customer Account",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SignupPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <CustomerAuthForm mode="signup" />
      </main>
    </>
  );
}
