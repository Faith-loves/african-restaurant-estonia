"use client";

import Link from "next/link";
import { FirebaseError } from "firebase/app";
import { sendPasswordResetEmail } from "firebase/auth";
import { FormEvent, useState } from "react";
import { LockKeyhole, Mail } from "lucide-react";

import { auth } from "@/lib/firebase/client";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setSent(false);
    setError("");

    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setSent(true);
    } catch (resetError) {
      if (resetError instanceof FirebaseError && resetError.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (resetError instanceof FirebaseError && resetError.code === "auth/network-request-failed") {
        setError("Firebase could not be reached. Check your internet connection and try again.");
      } else {
        // Keep the response deliberately generic so this flow does not reveal account existence.
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-[#FFF8EC] px-5 py-12 sm:px-8">
      <div className="w-full max-w-[460px] rounded-[28px] border border-[#321B29]/10 bg-white p-6 shadow-[0_15px_45px_rgba(50,27,41,0.08)] sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#294B73] text-[#FFF8EC]"><LockKeyhole size={24} aria-hidden="true" /></div>
        <div className="mt-5 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#B9472E]">African Restaurant Estonia</p>
          <h1 className="mt-2 font-[var(--font-cormorant)] text-4xl font-bold text-[#321B29]">Forgot Password?</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#151313]/60">Enter your email and we&apos;ll send a password reset link if an account is associated with it.</p>
        </div>

        {sent ? (
          <div role="status" className="mt-7 rounded-xl border border-[#D89A27]/30 bg-[#D89A27]/10 p-4 text-sm font-bold leading-6 text-[#321B29]">
            If an account uses that email, a reset link has been sent. Please check your inbox and spam folder.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <label htmlFor="reset-email" className="block text-sm font-bold text-[#321B29]">Email Address</label>
            <div className="relative">
              <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#321B29]/45" aria-hidden="true" />
              <input id="reset-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] py-3 pl-11 pr-4 text-sm font-semibold text-[#321B29] outline-none transition focus:border-[#D89A27]" />
            </div>
            {error && <p role="alert" className="rounded-xl border border-[#B9472E]/20 bg-[#B9472E]/10 px-4 py-3 text-sm font-bold text-[#B9472E]">{error}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#321B29] px-5 py-4 text-sm font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29] disabled:cursor-wait disabled:opacity-60">{loading ? "Sending Reset Link..." : "Send Reset Link"}</button>
          </form>
        )}

        <Link href="/login" className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#D89A27]/50 px-5 py-3 text-sm font-extrabold text-[#321B29] transition hover:border-[#D89A27] hover:bg-[#D89A27]/15">Back to Sign In</Link>
      </div>
    </section>
  );
}
