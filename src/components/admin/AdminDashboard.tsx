"use client";

import type {
  ComponentType,
} from "react";

import {
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowUpRight,
  BarChart3,
  ChefHat,
  CircleCheckBig,
  ExternalLink,
  LockKeyhole,
  LogOut,
  Settings,
  ShoppingBag,
  Sparkles,
  UserRound,
  UtensilsCrossed,
} from "lucide-react";

import {
  auth,
  db,
} from "@/lib/firebase/client";
import { useAdminAuthorization } from "@/components/admin/AdminGuard";

type DashboardCardProps = {
  title: string;
  description: string;
  eyebrow: string;
  icon: ComponentType<{
    size?: number;
    className?: string;
  }>;
  onClick?: () => void;
  status?: string;
  statusType?: "active" | "soon";
};

export default function AdminDashboard() {
  const router =
    useRouter();
  const { hasPermission, owner } = useAdminAuthorization();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    adminEmail,
    setAdminEmail,
  ] = useState("");

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (!user) {
            router.replace(
              "/login"
            );

            return;
          }

          try {
            const adminSnapshot =
              await getDoc(
                doc(
                  db,
                  "admins",
                  user.uid
                )
              );

            if (
              !adminSnapshot.exists()
            ) {
              await signOut(
                auth
              );

              router.replace(
                "/login"
              );

              return;
            }

            const adminData =
              adminSnapshot.data();

            if (
              adminData.role !== "admin" &&
              adminData.role !== "owner" ||
              adminData.active !==
                true
            ) {
              await signOut(
                auth
              );

              router.replace(
                "/login"
              );

              return;
            }

            setAdminEmail(
              user.email ?? ""
            );

            setLoading(
              false
            );
          } catch (error) {
            console.error(
              "Admin dashboard access check error:",
              error
            );

            await signOut(
              auth
            );

            router.replace(
              "/login"
            );
          }
        }
      );

    return () => {
      unsubscribe();
    };
  }, [router]);

  async function handleLogout() {
    await signOut(
      auth
    );

    router.replace(
      "/login"
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F3EA]">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#321B29]/10 border-t-[#321B29]" />

          <p className="mt-4 text-sm font-bold text-[#321B29]/55">
            Loading your dashboard...
          </p>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F0E8] text-[#151313]">

      {/* TOP NAVIGATION */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#261526]/95 text-white shadow-[0_8px_30px_rgba(38,21,38,0.14)] backdrop-blur">

        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D89A27] text-[#261526] shadow-sm">
              <UtensilsCrossed
                size={20}
              />
            </div>

            <div className="min-w-0">

              <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#D89A27] sm:text-xs">
                African Restaurant Estonia
              </p>

              <h1 className="truncate font-[var(--font-cormorant)] text-2xl font-bold leading-none text-white sm:text-3xl">
                Admin
              </h1>

            </div>

          </div>

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={() =>
                router.push("/")
              }
              className="hidden items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-extrabold text-white transition hover:border-[#D89A27] hover:bg-[#D89A27] hover:text-[#261526] sm:flex"
            >
              <ExternalLink
                size={15}
              />

              View Website
            </button>

            <button
              type="button"
              onClick={
                handleLogout
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:border-[#B9472E]/60 hover:bg-[#B9472E] sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2.5"
              aria-label="Logout"
            >
              <LogOut
                size={16}
              />

              <span className="hidden text-xs font-extrabold sm:inline">
                Logout
              </span>
            </button>

          </div>

        </div>

      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-12 lg:py-10">

        {/* WELCOME SECTION */}
        <section className="relative overflow-hidden rounded-[26px] bg-[#321B29] px-6 py-7 text-white shadow-[0_18px_55px_rgba(50,27,41,0.15)] sm:px-8 sm:py-8 lg:px-10">

          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#D89A27]/10" />

          <div className="absolute -bottom-32 right-20 h-72 w-72 rounded-full bg-[#B9472E]/10" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5">

                <Sparkles
                  size={13}
                  className="text-[#D89A27]"
                />

                <span className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-white/70">
                  Restaurant Control Centre
                </span>

              </div>

              <h2 className="mt-5 max-w-[720px] font-[var(--font-cormorant)] text-4xl font-bold leading-[0.95] sm:text-5xl lg:text-6xl">
                Your restaurant at a glance.
              </h2>

              <p className="mt-4 max-w-[680px] text-sm font-semibold leading-7 text-white/60">
                Update the menu, choose what is available today, manage restaurant information and keep the customer website up to date.
              </p>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 lg:min-w-[260px]">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D89A27] text-[#321B29]">
                  <UserRound
                    size={18}
                  />
                </div>

                <div className="min-w-0">

                  <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-white/40">
                    Signed in as
                  </p>

                  <p className="mt-0.5 truncate text-sm font-bold text-white">
                    {adminEmail}
                  </p>

                </div>

              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4">

                <CircleCheckBig
                  size={15}
                  className="text-green-300"
                />

                <span className="text-xs font-bold text-white/65">
                  Administrator access active
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* MOBILE VIEW WEBSITE */}
        <button
          type="button"
          onClick={() =>
            router.push("/")
          }
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#321B29]/10 bg-white px-4 py-3 text-xs font-extrabold text-[#321B29] shadow-sm sm:hidden"
        >
          <ExternalLink
            size={15}
          />

          View Customer Website
        </button>

        {/* SECTION TITLE */}
        <div className="mt-9 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="text-[11px] font-extrabold uppercase tracking-[0.19em] text-[#B9472E]">
              Control panel
            </p>

            <h2 className="mt-1 font-[var(--font-cormorant)] text-4xl font-bold text-[#321B29]">
              Management areas
            </h2>

          </div>

          <p className="max-w-[430px] text-sm font-semibold leading-6 text-[#151313]/50">
            Select an area below to manage the live restaurant website.
          </p>

        </div>

        {/* MAIN CARDS */}
        <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {hasPermission("manageMenu") && <DashboardCard
            eyebrow="Menu"
            title="Menu Management"
            description="Add foods, update prices, upload photos, edit availability and archive items."
            icon={
              UtensilsCrossed
            }
            status="Live"
            statusType="active"
            onClick={() =>
              router.push(
                "/admin/menu"
              )
            }
          />}

          {hasPermission("manageTodayMenu") && <DashboardCard
            eyebrow="Daily Service"
            title="Today's Menu"
            description="Select, remove and replace the meals customers can order today."
            icon={
              ChefHat
            }
            status="Live"
            statusType="active"
            onClick={() =>
              router.push(
                "/admin/today"
              )
            }
          />}

          {(hasPermission("manageOrders") || hasPermission("manageCatering")) && <DashboardCard
            eyebrow="Customers"
            title="Orders & Requests"
            description="View customer food orders, catering enquiries, event requests and food gift box requests."
            icon={
              ShoppingBag
            }
            status="Live"
            statusType="active"
            onClick={() =>
              router.push(
                "/admin/orders"
              )
            }
          />}

          {hasPermission("manageSettings") && <DashboardCard
            eyebrow="Website"
            title="Settings"
            description="Update the restaurant name, contact information, address and other public details."
            icon={
              Settings
            }
            status="Live"
            statusType="active"
            onClick={() =>
              router.push(
                "/admin/settings"
              )
            }
          />}

          {owner && <DashboardCard
            eyebrow="Administration"
            title="Admin Users"
            description="Invite administrators, set permissions and deactivate access when needed."
            icon={UserRound}
            status="Owner only"
            statusType="active"
            onClick={() => router.push("/admin/admins")}
          />}

          {hasPermission("viewAnalytics") && <DashboardCard
            eyebrow="Insights"
            title="Analytics"
            description="Understand order activity, customer patterns, food popularity and request volume."
            icon={BarChart3}
            status="Live"
            statusType="active"
            onClick={() => router.push("/admin/analytics")}
          />}

        </section>

        {/* QUICK ACTIONS */}
        <section className="mt-8 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">

          <div className="rounded-[24px] border border-[#321B29]/10 bg-white p-5 shadow-[0_8px_30px_rgba(50,27,41,0.04)] sm:p-6">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#B9472E]">
                  Quick Actions
                </p>

                <h3 className="mt-1 font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">
                  Common Tasks
                </h3>

              </div>

              <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-[#D89A27]/15 text-[#B9472E] sm:flex">
                <Sparkles
                  size={19}
                />
              </div>

            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">

              {hasPermission("manageMenu") && <QuickAction
                title="Add or Edit Food"
                description="Open Menu Management"
                onClick={() =>
                  router.push(
                    "/admin/menu"
                  )
                }
              />}

              {hasPermission("manageTodayMenu") && <QuickAction
                title="Change Today's Menu"
                description="Update today's selection"
                onClick={() =>
                  router.push(
                    "/admin/today"
                  )
                }
              />}

              {hasPermission("manageSettings") && <QuickAction
                title="Update Contact Info"
                description="Open website settings"
                onClick={() =>
                  router.push(
                    "/admin/settings"
                  )
                }
              />}

            </div>

          </div>

          <div className="rounded-[24px] border border-[#D89A27]/25 bg-[#D89A27]/10 p-5 sm:p-6">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#321B29] text-[#D89A27]">
              <LockKeyhole
                size={19}
              />
            </div>

            <h3 className="mt-5 font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">
              Secure Admin
            </h3>

            <p className="mt-2 text-sm font-semibold leading-6 text-[#151313]/55">
              Only authenticated restaurant administrators can access these management pages.
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}

function DashboardCard({
  title,
  description,
  eyebrow,
  icon: Icon,
  onClick,
  status,
  statusType = "active",
}: DashboardCardProps) {
  const enabled =
    Boolean(
      onClick
    );

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      disabled={
        !enabled
      }
      className={`group relative flex min-h-[355px] flex-col overflow-hidden rounded-[24px] border p-5 text-left transition duration-300 sm:p-6 ${
        enabled
          ? "border-[#321B29]/10 bg-white shadow-[0_8px_30px_rgba(50,27,41,0.05)] hover:-translate-y-1 hover:border-[#D89A27]/70 hover:shadow-[0_16px_40px_rgba(50,27,41,0.10)]"
          : "cursor-default border-[#321B29]/8 bg-white/65"
      }`}
    >

      <div className="flex items-start justify-between gap-4">

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${
            enabled
              ? "bg-[#321B29] text-[#D89A27] group-hover:bg-[#D89A27] group-hover:text-[#321B29]"
              : "bg-[#321B29]/8 text-[#321B29]/35"
          }`}
        >
          <Icon
            size={20}
          />
        </div>

        {status && (
          <span
            className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] ${
              statusType ===
              "active"
                ? "bg-green-50 text-green-700"
                : "bg-[#D89A27]/15 text-[#B9472E]"
            }`}
          >
            {status}
          </span>
        )}

      </div>

      <p className="mt-7 text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#B9472E]">
        {eyebrow}
      </p>

      <h3 className="mt-1 font-[var(--font-cormorant)] text-[30px] font-bold leading-tight text-[#321B29]">
        {title}
      </h3>

      <p className="mt-3 min-h-[72px] text-sm font-semibold leading-6 text-[#151313]/50">
        {description}
      </p>

      <div className="mt-auto pt-6">

        {enabled ? (
          <div className="flex items-center justify-between border-t border-[#321B29]/10 pt-4">

            <span className="text-xs font-extrabold text-[#321B29]">
              Open
            </span>

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF8EC] text-[#B9472E] transition group-hover:bg-[#321B29] group-hover:text-white">
              <ArrowUpRight
                size={15}
              />
            </div>

          </div>
        ) : (
          <div className="border-t border-[#321B29]/10 pt-4">

            <span className="text-xs font-bold text-[#321B29]/35">
              Available after order integration
            </span>

          </div>
        )}

      </div>

    </button>
  );
}

function QuickAction({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="group rounded-2xl border border-[#321B29]/10 bg-[#FFF8EC] p-4 text-left transition hover:border-[#D89A27] hover:bg-[#D89A27]/10"
    >

      <div className="flex items-start justify-between gap-3">

        <div>

          <h4 className="text-sm font-extrabold text-[#321B29]">
            {title}
          </h4>

          <p className="mt-1 text-xs font-semibold leading-5 text-[#151313]/45">
            {description}
          </p>

        </div>

        <ArrowUpRight
          size={15}
          className="shrink-0 text-[#B9472E] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />

      </div>

    </button>
  );
}

