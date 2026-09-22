import type { Metadata } from "next";

import CustomerAuthForm from "@/components/auth/CustomerAuthForm";

export const metadata: Metadata = {
  title: "Sign In",
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginPage() {
  return (
    <main>
      <CustomerAuthForm mode="login" />
    </main>
  );
}
