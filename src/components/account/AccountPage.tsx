"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCw, ShoppingBag } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useGuestSession } from "@/context/GuestSessionContext";
import CustomerOrderUpdates from "@/components/account/CustomerOrderUpdates";

type AccountOrder = {
  id: string;
  reference: string;
  status: string;
  fulfilment: string;
  subtotal: number;
  total: number;
  currency: string;
  createdAt: string | null;
  updatedAt?: string | null;
  items: Array<{ name: string; quantity: number; size: string | null; addOns: string[]; lineTotal: number | null }>;
};

function statusLabel(status: string) {
  if (status === "cancelled" || status === "declined") return "Declined / Cancelled";
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClasses(status: string) {
  if (status === "cancelled" || status === "declined") return "border-red-200 bg-red-50 text-red-700";
  if (status === "completed" || status === "ready") return "border-green-200 bg-green-50 text-green-700";
  if (status === "confirmed" || status === "preparing") return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-[#D89A27]/30 bg-[#D89A27]/10 text-[#8A5A00]";
}

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(value);
}

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { guestActive, ready: guestReady, exitGuestSession } = useGuestSession();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    if (!user && !guestActive) return;
    setLoading(true);
    setError("");
    try {
      const headers: HeadersInit = {};
      if (user && !guestActive) headers.Authorization = `Bearer ${await user.getIdToken()}`;
      const response = await fetch("/api/account/orders", { headers, cache: "no-store" });
      const result = (await response.json()) as { admin?: boolean; guest?: boolean; orders?: AccountOrder[]; error?: string };
      if (result.admin && !guestActive) {
        router.replace("/admin");
        return;
      }
      if (!response.ok) throw new Error(result.error || "Your order history could not be loaded.");
      setOrders(result.orders || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Your order history could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [guestActive, router, user]);

  useEffect(() => {
    if (authLoading || !guestReady) return;
    if (!user && !guestActive) {
      router.replace("/login");
      return;
    }
    const timer = window.setTimeout(() => void loadOrders(), 0);
    return () => window.clearTimeout(timer);
  }, [authLoading, guestActive, guestReady, loadOrders, router, user]);

  if (authLoading || !guestReady || (!user && !guestActive)) return <section className="min-h-[70vh] bg-[#FFF8EC]" />;

  return (
    <section className="min-h-[70vh] bg-[#FFF8EC] px-5 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1000px]">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#B9472E]">{user && !guestActive ? "Customer Account" : "Guest Account"}</p>
            <h1 className="mt-2 font-[var(--font-cormorant)] text-5xl font-bold text-[#321B29]">Welcome, {user && !guestActive ? user.displayName?.split(" ")[0] || "Customer" : "Guest"}.</h1>
            <p className="mt-2 text-sm font-semibold text-[#151313]/60">{user && !guestActive ? user.email : "Your guest orders are secured to this browser session."}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <CustomerOrderUpdates orders={orders} identityKey={user?.uid || "guest"} />
            <button type="button" onClick={() => void loadOrders()} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#321B29]/15 bg-white px-4 py-3 text-sm font-extrabold text-[#321B29] disabled:opacity-60"><RefreshCw size={16} className={loading ? "animate-spin" : ""} />Refresh</button>
            {user && !guestActive ? <button type="button" onClick={() => void logout()} className="min-h-11 rounded-xl bg-[#321B29] px-4 py-3 text-sm font-extrabold text-white">Log out</button> : <button type="button" onClick={() => { if (window.confirm("Exit this guest session? You may lose access to its order history on this device.")) void exitGuestSession().then(() => router.replace("/")); }} className="min-h-11 rounded-xl bg-[#321B29] px-4 py-3 text-sm font-extrabold text-white">Exit Guest Session</button>}
          </div>
        </div>

        <div className="mt-9 rounded-[26px] border border-[#321B29]/10 bg-white p-6 shadow-[0_12px_40px_rgba(50,27,41,0.06)] sm:p-8">
          <div className="flex items-center gap-3"><ShoppingBag className="text-[#B9472E]" size={22} /><h2 className="font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">Your Orders</h2></div>
          {error && <p role="alert" className="mt-5 rounded-xl bg-[#B9472E]/10 p-4 text-sm font-bold text-[#B9472E]">{error}</p>}
          {!loading && !error && orders.length === 0 && <div className="mt-7 rounded-2xl bg-[#FFF8EC] p-6 text-center"><p className="font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">No orders yet</p><p className="mt-2 text-sm font-semibold text-[#151313]/60">Orders placed from this account will appear here.</p><Link href="/menu" className="mt-5 inline-flex rounded-xl bg-[#321B29] px-5 py-3 text-sm font-extrabold text-white">View Menu</Link></div>}
          <div className="mt-6 space-y-5">
            {orders.map((order) => (
              <article key={order.id} className="rounded-2xl border border-[#321B29]/10 bg-[#FFF8EC] p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div><p className="break-words text-xs font-extrabold uppercase tracking-[0.12em] text-[#B9472E]">{order.reference}</p><p className="mt-1 text-sm font-semibold text-[#151313]/60">{order.createdAt ? new Date(order.createdAt).toLocaleString("en-GB") : "Date unavailable"} · {order.fulfilment === "delivery" ? "Delivery" : "Pickup"}</p>{order.updatedAt && <p className="mt-1 text-xs font-semibold text-[#151313]/55">Updated {new Date(order.updatedAt).toLocaleString("en-GB")}</p>}</div>
                  <span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-extrabold ${statusClasses(order.status)}`}>{statusLabel(order.status)}</span>
                </div>
                {!['completed', 'cancelled', 'declined'].includes(order.status) && <p className="mt-4 rounded-xl bg-[#D89A27]/10 px-4 py-3 text-xs font-semibold leading-5 text-[#321B29]">Need to change or cancel your order? Please contact the restaurant as soon as possible.</p>}
                <div className="mt-5 space-y-2 border-t border-[#321B29]/10 pt-4">{order.items.map((item, index) => <div key={`${item.name}-${index}`} className="flex justify-between gap-4 text-sm font-semibold text-[#321B29]"><span>{item.quantity} × {item.name}{item.size ? ` · ${item.size}` : ""}{item.addOns.length ? ` · ${item.addOns.join(", ")}` : ""}</span>{item.lineTotal !== null && <span className="shrink-0">{money(item.lineTotal, order.currency)}</span>}</div>)}</div>
                <div className="mt-5 flex justify-between border-t border-[#321B29]/10 pt-4 text-sm font-extrabold text-[#321B29]"><span>Total</span><span>{money(order.total, order.currency)}</span></div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
