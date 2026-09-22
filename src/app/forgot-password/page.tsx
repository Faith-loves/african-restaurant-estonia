import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your African Restaurant Estonia customer account password.",
  alternates: { canonical: "/forgot-password" },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
