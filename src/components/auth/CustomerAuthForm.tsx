"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

import {
  FormEvent,
  useState,
} from "react";

import { auth, db } from "@/lib/firebase/client";
import { isActiveAdminRecord } from "@/lib/admin/permissions";
import { useGuestSession } from "@/context/GuestSessionContext";

type CustomerAuthMode = "login" | "signup";

function getFriendlyAuthError(error: unknown) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "The email or password is incorrect. Please try again.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/email-already-in-use":
        return "The email or password could not be used. Please try another email or sign in instead.";
      case "auth/weak-password":
        return "Please choose a stronger password with at least 8 characters.";
      case "auth/too-many-requests":
        return "Too many attempts were made. Please wait a little and try again.";
      case "auth/network-request-failed":
        return "Firebase could not be reached. Check your internet connection.";
      case "auth/operation-not-allowed":
        return "Email and password accounts are not enabled yet. Please contact the restaurant administrator.";
      default:
        return "Authentication could not be completed. Please try again.";
    }
  }

  if (error instanceof Error && error.message.includes("customer profile")) {
    return error.message;
  }

  return "Authentication could not be completed. Please try again.";
}

export default function CustomerAuthForm({
  mode,
}: {
  mode: CustomerAuthMode;
}) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const { guestActive, exitGuestSession } = useGuestSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (isSignup && !trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    if (isSignup && password.length < 8) {
      setError("Please choose a password with at least 8 characters.");
      return;
    }

    if (isSignup && password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        const credential =
          await createUserWithEmailAndPassword(
            auth,
            trimmedEmail,
            password
          );

        await updateProfile(credential.user, {
          displayName: trimmedName,
        });

        try {
          await setDoc(
            doc(db, "customers", credential.user.uid),
            {
              uid: credential.user.uid,
              name: trimmedName,
              email: trimmedEmail,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }
          );
        } catch {
          throw new Error(
            "Your account was created, but the customer profile could not be saved. Please try signing in again."
          );
        }
      } else {
        const credential = await signInWithEmailAndPassword(
          auth,
          trimmedEmail,
          password
        );

        const adminSnapshot = await getDoc(
          doc(db, "admins", credential.user.uid)
        );
        const adminData = adminSnapshot.exists()
          ? adminSnapshot.data()
          : null;

        if (isActiveAdminRecord(adminData)) {
          if (guestActive) await exitGuestSession();
          router.replace("/admin");
          return;
        }
      }

      if (guestActive) await exitGuestSession();
      router.replace("/");
    } catch (authError) {
      setError(getFriendlyAuthError(authError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-[#FFF8EC] px-5 py-12 sm:px-8">
      <div className="w-full max-w-[460px] rounded-[28px] border border-[#321B29]/10 bg-white p-6 shadow-[0_15px_45px_rgba(50,27,41,0.08)] sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#294B73] text-[#FFF8EC]">
          {isSignup ? <UserRound size={24} /> : <LockKeyhole size={24} />}
        </div>

        <div className="mt-5 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#B9472E]">
            African Restaurant Estonia
          </p>
          <h1 className="mt-2 font-[var(--font-cormorant)] text-4xl font-bold text-[#321B29]">
            {isSignup ? "Create Your Account" : "Sign In"}
          </h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#151313]/55">
            {isSignup
              ? "Save your details for a smoother future ordering experience."
              : "Sign in to your customer account, or continue as a guest."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          {isSignup && (
            <div>
              <label htmlFor="customer-name" className="mb-2 block text-sm font-bold text-[#321B29]">
                Full Name
              </label>
              <div className="relative">
                <UserRound size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#321B29]/45" />
                <input
                  id="customer-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] py-3 pl-11 pr-4 text-sm font-semibold text-[#321B29] outline-none transition focus:border-[#D89A27]"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="customer-email" className="mb-2 block text-sm font-bold text-[#321B29]">
              Email Address
            </label>
            <div className="relative">
              <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#321B29]/45" />
              <input
                id="customer-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] py-3 pl-11 pr-4 text-sm font-semibold text-[#321B29] outline-none transition focus:border-[#D89A27]"
              />
            </div>
          </div>

          <PasswordField
            id="customer-password"
            label="Password"
            value={password}
            onChange={setPassword}
            visible={showPassword}
            onToggle={() => setShowPassword((current) => !current)}
            autocomplete={isSignup ? "new-password" : "current-password"}
          />

          {!isSignup && (
            <div className="text-right">
              <Link href="/forgot-password" className="text-sm font-bold text-[#294B73] underline underline-offset-4">
                Forgot password?
              </Link>
            </div>
          )}

          {isSignup && (
            <PasswordField
              id="customer-confirm-password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((current) => !current)}
              autocomplete="new-password"
            />
          )}

          {error && (
            <div role="alert" className="rounded-xl border border-[#B9472E]/20 bg-[#B9472E]/10 px-4 py-3 text-sm font-bold leading-6 text-[#B9472E]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#321B29] px-5 py-4 text-sm font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29] disabled:cursor-wait disabled:opacity-60"
          >
            {loading
              ? isSignup
                ? "Creating Account..."
                : "Signing In..."
              : isSignup
                ? "Create Account"
                : "Sign In"}
          </button>

          {isSignup && (
            <p className="text-center text-xs font-semibold leading-5 text-[#151313]/55">
              By creating an account, you agree to the{" "}
              <Link href="/terms" className="font-bold text-[#294B73] underline">
                Terms &amp; Conditions
              </Link>{" "}
              and acknowledge the{" "}
              <Link href="/privacy" className="font-bold text-[#294B73] underline">
                Privacy Policy
              </Link>.
            </p>
          )}
        </form>

        <div className="mt-6 space-y-3 text-center text-sm font-semibold">
          <p className="text-[#151313]/60">
            {isSignup ? "Already have an account?" : "New to African Restaurant Estonia?"}{" "}
            <Link href={isSignup ? "/login" : "/signup"} className="font-extrabold text-[#294B73] underline-offset-4 hover:underline">
              {isSignup ? "Sign in" : "Create an account"}
            </Link>
          </p>

          <Link
            href="/menu"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#D89A27]/50 bg-[#FFF8EC] px-5 py-3 text-sm font-extrabold text-[#321B29] transition hover:border-[#D89A27] hover:bg-[#D89A27]/15"
          >
            Continue as Guest
          </Link>
        </div>
      </div>
    </section>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
  autocomplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  autocomplete: "current-password" | "new-password";
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold text-[#321B29]">
        {label}
      </label>
      <div className="relative">
        <LockKeyhole size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#321B29]/45" />
        <input
          id={id}
          type={visible ? "text" : "password"}
          required
          minLength={autocomplete === "new-password" ? 8 : undefined}
          autoComplete={autocomplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter password"
          className="w-full rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] py-3 pl-11 pr-12 text-sm font-semibold text-[#321B29] outline-none transition focus:border-[#D89A27]"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#321B29]/55 transition hover:bg-[#D89A27]/15 hover:text-[#321B29]"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
