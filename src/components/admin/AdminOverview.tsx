"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, type Timestamp } from "firebase/firestore";
import { ArrowUpRight, CalendarDays, ChevronRight, CircleDollarSign, Clock3, ShoppingBag, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAdminAuthorization } from "@/components/admin/AdminGuard";
import { auth, db } from "@/lib/firebase/client";

type OverviewData = {
  summary: { totalOrders: number; activeOrders: number; completedOrders: number; totalCateringRequests: number; orderValue: number };
  orderStatuses: Record<string, number>;
  customers: { totalIdentifiable: number; registered: number; guests: number; repeat: number };
};

type RecentOrder = { id: string; reference?: string; status?: string; total?: number; customer?: { name?: string }; createdAt?: Timestamp | { seconds?: number } | string | null };
type RecentRequest = { id: string; reference?: string; status?: string; serviceType?: string; customer?: { name?: string }; createdAt?: Timestamp | { seconds?: number } | string | null };

function dateValue(value: RecentOrder["createdAt"]) {
  if (!value) return 0;
  if (typeof value === "string") return Date.parse(value) || 0;
  if (typeof value === "object" && "toMillis" in value && typeof value.toMillis === "function") return value.toMillis();
  if (typeof value === "object" && typeof value.seconds === "number") return value.seconds * 1000;
  return 0;
}

function shortDate(value: RecentOrder["createdAt"]) {
  const time = dateValue(value);
  return time ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(new Date(time)) : "Just now";
}

function money(value: number) {
  return new Intl.NumberFormat("et-EE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function statusLabel(status?: string) {
  return (status ?? "pending_confirmation").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AdminOverview() {
  const router = useRouter();
  const { hasPermission } = useAdminAuthorization();
  const canOrders = hasPermission("manageOrders");
  const canCatering = hasPermission("manageCatering");
  const canAnalytics = hasPermission("viewAnalytics");
  const canCustomers = hasPermission("viewCustomers");
  const [analytics, setAnalytics] = useState<OverviewData | null>(null);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [requests, setRequests] = useState<RecentRequest[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    if (!canAnalytics || !auth.currentUser) return;
    void auth.currentUser.getIdToken().then((token) => fetch("/api/admin/analytics?range=all", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }))
      .then((response) => response.ok ? response.json() as Promise<OverviewData> : Promise.reject(new Error("analytics")))
      .then((data) => { if (active) setAnalytics(data); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [canAnalytics]);

  useEffect(() => {
    if (!canOrders) return;
    return onSnapshot(collection(db, "orders"), (snapshot) => {
      setOrders(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as RecentOrder)).sort((a, b) => dateValue(b.createdAt) - dateValue(a.createdAt)).slice(0, 5));
    }, () => setError(true));
  }, [canOrders]);

  useEffect(() => {
    if (!canCatering) return;
    return onSnapshot(collection(db, "cateringRequests"), (snapshot) => {
      setRequests(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as RecentRequest)).filter((item) => item.serviceType !== "gift-box").sort((a, b) => dateValue(b.createdAt) - dateValue(a.createdAt)).slice(0, 4));
    }, () => setError(true));
  }, [canCatering]);

  const statusRows = useMemo(() => ["pending_confirmation", "confirmed", "preparing", "ready", "completed"].map((status) => ({ status, count: analytics?.orderStatuses?.[status] ?? 0 })), [analytics]);
  const statusTotal = Math.max(1, statusRows.reduce((total, item) => total + item.count, 0));
  const cards = [
    { label: "Total orders", value: analytics ? analytics.summary.totalOrders : "—", detail: analytics ? money(analytics.summary.orderValue) : "Analytics permission required", icon: ShoppingBag, tone: "bg-[#321B29] text-white" },
    { label: "Active orders", value: analytics ? analytics.summary.activeOrders : "—", detail: "Needs attention", icon: Clock3, tone: "bg-[#D89A27] text-[#321B29]" },
    { label: "Completed", value: analytics ? analytics.summary.completedOrders : "—", detail: "All-time completed", icon: CircleDollarSign, tone: "bg-white text-[#321B29]" },
    { label: "Catering requests", value: analytics ? analytics.summary.totalCateringRequests : "—", detail: canCatering ? "Open requests" : "Restricted", icon: CalendarDays, tone: "bg-white text-[#321B29]" },
  ];

  return <section className="mt-8 space-y-5" aria-label="Restaurant overview">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-[11px] font-extrabold uppercase tracking-[0.19em] text-[#B9472E]">Live overview</p><h2 className="mt-1 font-[var(--font-cormorant)] text-4xl font-bold text-[#321B29]">Today at a glance</h2></div>
      <button type="button" onClick={() => router.push("/admin/analytics")} disabled={!canAnalytics} className="inline-flex min-h-10 items-center gap-2 self-start rounded-xl border border-[#321B29]/10 bg-white px-4 text-xs font-extrabold text-[#321B29] shadow-sm disabled:cursor-not-allowed disabled:opacity-45 sm:self-auto">View full analytics <ArrowUpRight size={15} /></button>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, detail, icon: Icon, tone }) => <div key={label} className={`rounded-2xl border border-[#321B29]/10 p-5 shadow-[0_8px_30px_rgba(50,27,41,0.04)] ${tone}`}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[0.1em] opacity-60">{label}</p><p className="mt-3 text-3xl font-black">{value}</p><p className="mt-1 text-xs font-bold opacity-60">{detail}</p></div><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B9472E]/15"><Icon size={18} /></span></div></div>)}</div>

    <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      {canAnalytics && <div className="rounded-2xl border border-[#321B29]/10 bg-white p-5 shadow-[0_8px_30px_rgba(50,27,41,0.04)] sm:p-6"><div className="flex items-start justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#B9472E]">Order flow</p><h3 className="mt-1 text-xl font-black text-[#321B29]">Status breakdown</h3></div><ShoppingBag size={19} className="text-[#D89A27]" /></div><div className="mt-6 space-y-4">{statusRows.map(({ status, count }) => <div key={status}><div className="mb-1 flex justify-between text-xs font-extrabold text-[#321B29]"><span>{statusLabel(status)}</span><span>{count}</span></div><div className="h-2 overflow-hidden rounded-full bg-[#F4F0E8]"><div className="h-full rounded-full bg-[#B9472E]" style={{ width: `${Math.min(100, (count / statusTotal) * 100)}%` }} /></div></div>)}</div></div>}
      {canCustomers && <div className="rounded-2xl border border-[#321B29]/10 bg-[#FFF8EC] p-5 shadow-[0_8px_30px_rgba(50,27,41,0.04)] sm:p-6"><div className="flex items-start justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#B9472E]">Customer insight</p><h3 className="mt-1 text-xl font-black text-[#321B29]">Who is ordering</h3></div><UsersRound size={19} className="text-[#B9472E]" /></div>{analytics ? <div className="mt-6 grid grid-cols-2 gap-3">{[["Identifiable", analytics.customers.totalIdentifiable], ["Registered", analytics.customers.registered], ["Guest", analytics.customers.guests], ["Repeat", analytics.customers.repeat]].map(([label, value]) => <div key={label} className="rounded-xl bg-white p-4"><p className="text-2xl font-black text-[#321B29]">{value}</p><p className="mt-1 text-xs font-bold text-[#151313]/55">{label}</p></div>)}</div> : <p className="mt-6 text-sm font-semibold text-[#151313]/55">Loading customer insights…</p>}</div>}
    </div>

    {(canOrders || canCatering) && <div className="grid gap-5 xl:grid-cols-2"><div className="rounded-2xl border border-[#321B29]/10 bg-white p-5 shadow-[0_8px_30px_rgba(50,27,41,0.04)] sm:p-6"><div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#B9472E]">Customer activity</p><h3 className="mt-1 text-xl font-black text-[#321B29]">Recent orders</h3></div><button type="button" onClick={() => router.push("/admin/orders#orders")} className="text-xs font-extrabold text-[#B9472E]">View all <ChevronRight size={14} className="inline" /></button></div>{canOrders ? <div className="mt-4 divide-y divide-[#321B29]/10">{orders.length ? orders.map((order) => <button type="button" key={order.id} onClick={() => router.push(`/admin/orders#orders`)} className="flex w-full items-center justify-between gap-3 py-3 text-left"><span className="min-w-0"><span className="block truncate text-sm font-extrabold text-[#321B29]">{order.customer?.name || "Customer"}</span><span className="mt-1 block text-xs font-semibold text-[#151313]/50">{order.reference || order.id.slice(0, 8)} · {shortDate(order.createdAt)}</span></span><span className="shrink-0 text-right"><span className="block text-sm font-black text-[#321B29]">{money(order.total || 0)}</span><span className="mt-1 block text-[10px] font-extrabold uppercase text-[#B9472E]">{statusLabel(order.status)}</span></span></button>) : <p className="py-8 text-center text-sm font-semibold text-[#151313]/50">No orders yet.</p>}</div> : <p className="mt-5 text-sm font-semibold text-[#151313]/50">Orders are restricted for this account.</p>}</div>
      <div className="rounded-2xl border border-[#321B29]/10 bg-white p-5 shadow-[0_8px_30px_rgba(50,27,41,0.04)] sm:p-6"><div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#B9472E]">Events desk</p><h3 className="mt-1 text-xl font-black text-[#321B29]">Recent catering</h3></div><button type="button" onClick={() => router.push("/admin/orders#catering")} className="text-xs font-extrabold text-[#B9472E]">View all <ChevronRight size={14} className="inline" /></button></div>{canCatering ? <div className="mt-4 divide-y divide-[#321B29]/10">{requests.length ? requests.map((request) => <button type="button" key={request.id} onClick={() => router.push(`/admin/orders#catering`)} className="flex w-full items-center justify-between gap-3 py-3 text-left"><span className="min-w-0"><span className="block truncate text-sm font-extrabold text-[#321B29]">{request.customer?.name || "Customer"}</span><span className="mt-1 block text-xs font-semibold text-[#151313]/50">{request.reference || request.id.slice(0, 8)} · {shortDate(request.createdAt)}</span></span><span className="shrink-0 text-right"><span className="block text-sm font-black text-[#321B29]">{request.serviceType || "event"}</span><span className="mt-1 block text-[10px] font-extrabold uppercase text-[#B9472E]">{statusLabel(request.status)}</span></span></button>) : <p className="py-8 text-center text-sm font-semibold text-[#151313]/50">No catering requests yet.</p>}</div> : <p className="mt-5 text-sm font-semibold text-[#151313]/50">Catering is restricted for this account.</p>}</div></div>}
    {error && <p className="text-xs font-semibold text-[#B9472E]">Some live overview data is temporarily unavailable. Open the related management page to retry.</p>}
  </section>;
}
