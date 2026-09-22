"use client";

import { useCallback, useEffect, useState } from "react";
import { getIdToken, onAuthStateChanged, type User } from "firebase/auth";
import { ArrowLeft, BarChart3, CalendarDays, CircleAlert, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";

type Range = "7d" | "30d" | "month" | "all" | "custom";
type Analytics = {
  canViewCustomers: boolean;
  summary: { totalOrders: number; completedOrders: number; activeOrders: number; cancelledOrders: number; orderValue: number; completedOrderValue: number; averageOrderValue: number; totalCateringRequests: number; totalGiftBoxRequests: number };
  orderStatuses: Record<string, number>;
  foodPopularity: { name: string; quantity: number; orders: number; orderValue: number }[];
  customers: { totalIdentifiable: number; registered: number; guests: number; repeat: number; oneTime: number; top: { name: string; email: string; phone: string; type: string; orders: number; orderValue: number; completedOrderValue: number; lastOrderDate: string | null }[] };
  catering: { total: number; pending: number; confirmed: number; completed: number; declined: number };
  giftBox: { total: number; pending: number; confirmed: number; completed: number; declined: number };
};

const emptyAnalytics: Analytics = { canViewCustomers: false, summary: { totalOrders: 0, completedOrders: 0, activeOrders: 0, cancelledOrders: 0, orderValue: 0, completedOrderValue: 0, averageOrderValue: 0, totalCateringRequests: 0, totalGiftBoxRequests: 0 }, orderStatuses: {}, foodPopularity: [], customers: { totalIdentifiable: 0, registered: 0, guests: 0, repeat: 0, oneTime: 0, top: [] }, catering: { total: 0, pending: 0, confirmed: 0, completed: 0, declined: 0 }, giftBox: { total: 0, pending: 0, confirmed: 0, completed: 0, declined: 0 } };

function money(value: number) { return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(value); }
function dateLabel(value: string | null) { return value ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value)) : "Date unavailable"; }

export default function AdminAnalytics() {
  const router = useRouter();
  const [range, setRange] = useState<Range>("30d");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [data, setData] = useState<Analytics>(emptyAnalytics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (user: User) => {
    setLoading(true); setError("");
    try {
      const token = await getIdToken(user);
      const params = new URLSearchParams({ range });
      if (range === "custom") { if (start) params.set("start", start); if (end) params.set("end", end); }
      const response = await fetch(`/api/admin/analytics?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load analytics.");
      setData(payload as Analytics);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Unable to load analytics."); }
    finally { setLoading(false); }
  }, [end, range, start]);

  useEffect(() => onAuthStateChanged(auth, (user) => { if (user) void load(user); }), [load]);

  const cards = [
    ["Total Orders", data.summary.totalOrders.toString()], ["Completed Orders", data.summary.completedOrders.toString()], ["Pending / Active", data.summary.activeOrders.toString()], ["Cancelled Orders", data.summary.cancelledOrders.toString()], ["Total Order Value", money(data.summary.orderValue)], ["Completed Order Value", money(data.summary.completedOrderValue)], ["Average Order Value", money(data.summary.averageOrderValue)], ["Catering Requests", data.summary.totalCateringRequests.toString()], ["Gift Box Requests", data.summary.totalGiftBoxRequests.toString()],
  ];

  return <main className="min-h-screen bg-[#FFF8EC] text-[#151313]"><header className="sticky top-0 z-20 border-b border-[#321B29]/10 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-[1500px] items-center gap-4 px-5 py-5 sm:px-8 lg:px-12"><button type="button" onClick={() => router.push("/admin")} aria-label="Back to admin dashboard" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#321B29]/10 text-[#321B29]"><ArrowLeft size={18} /></button><div className="min-w-0"><p className="truncate text-xs font-extrabold uppercase tracking-[0.18em] text-[#B9472E]">African Restaurant Estonia</p><h1 className="font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">Analytics</h1></div></div></header><section className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-12"><div className="rounded-[28px] bg-[#321B29] p-6 text-white sm:p-8"><BarChart3 className="text-[#D89A27]" size={28} /><h2 className="mt-4 font-[var(--font-cormorant)] text-4xl font-bold sm:text-5xl">Understand your restaurant activity.</h2><p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-white/65">Order value shown here is based on submitted order records. It does not represent payment or money received.</p></div><div className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-[#321B29]/10 bg-white p-4"><label className="text-xs font-extrabold uppercase tracking-wide text-[#321B29]/65">Date range<select value={range} onChange={(event) => setRange(event.target.value as Range)} className="mt-1 block min-h-11 rounded-lg border p-2 text-sm normal-case tracking-normal"><option value="7d">Last 7 Days</option><option value="30d">Last 30 Days</option><option value="month">This Month</option><option value="all">All Time</option><option value="custom">Custom Range</option></select></label>{range === "custom" && <><label className="text-xs font-extrabold uppercase tracking-wide text-[#321B29]/65">Start<input type="date" value={start} onChange={(event) => setStart(event.target.value)} className="mt-1 block min-h-11 rounded-lg border p-2 text-sm normal-case tracking-normal" /></label><label className="text-xs font-extrabold uppercase tracking-wide text-[#321B29]/65">End<input type="date" value={end} onChange={(event) => setEnd(event.target.value)} className="mt-1 block min-h-11 rounded-lg border p-2 text-sm normal-case tracking-normal" /></label></>}<CalendarDays size={18} className="mb-3 text-[#B9472E]" /></div>{error && <div className="mt-5 flex gap-2 rounded-xl border border-[#B9472E]/20 bg-[#B9472E]/10 p-4 text-sm font-bold text-[#B9472E]"><CircleAlert size={18} />{error}</div>}{loading ? <div className="py-16 text-center font-semibold text-[#321B29]/60">Loading analytics…</div> : <><section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, value]) => <div key={label} className="rounded-2xl border border-[#321B29]/10 bg-white p-5"><p className="text-xs font-extrabold uppercase tracking-wide text-[#B9472E]">{label}</p><p className="mt-3 font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">{value}</p></div>)}</section><div className="mt-6 grid gap-6 xl:grid-cols-2"><Panel title="Order status breakdown"><div className="grid gap-3 sm:grid-cols-2">{Object.entries(data.orderStatuses).map(([status, count]) => <div key={status} className="flex justify-between rounded-xl bg-[#FFF8EC] p-3 text-sm"><span>{status.replaceAll("_", " ")}</span><strong>{count}</strong></div>)}</div></Panel><Panel title="Most ordered foods"><div className="space-y-3">{data.foodPopularity.length ? data.foodPopularity.map((food) => <div key={food.name} className="flex items-center justify-between gap-4 border-b border-[#321B29]/10 pb-3 text-sm"><div className="min-w-0"><p className="truncate font-bold">{food.name}</p><p className="text-xs text-black/50">{food.orders} order{food.orders === 1 ? "" : "s"} · {money(food.orderValue)} order value</p></div><strong className="shrink-0 text-[#B9472E]">{food.quantity} ordered</strong></div>) : <Empty text="No orders in this period." />}</div></Panel></div><div className="mt-6 grid gap-6 xl:grid-cols-2"><Panel title="Catering & event requests"><RequestSummary data={data.catering} empty="No catering requests in this period." /></Panel><Panel title="Gift box requests"><RequestSummary data={data.giftBox} empty="No gift-box requests in this period." /></Panel></div><Panel title="Customer insights"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><Stat label="Identifiable customers" value={data.customers.totalIdentifiable} /><Stat label="Registered" value={data.customers.registered} /><Stat label="Guest" value={data.customers.guests} /><Stat label="Repeat customers" value={data.customers.repeat} /><Stat label="One-time customers" value={data.customers.oneTime} /></div>{data.canViewCustomers ? <div className="mt-6 overflow-x-auto"><h3 className="mb-3 flex items-center gap-2 font-bold text-[#321B29]"><Users size={18} />Top customers</h3>{data.customers.top.length ? <table className="min-w-[760px] w-full text-left text-sm"><thead><tr className="border-b text-xs uppercase text-black/50"><th className="p-2">Customer</th><th className="p-2">Type</th><th className="p-2">Orders</th><th className="p-2">Order Value</th><th className="p-2">Completed Value</th><th className="p-2">Last Order</th></tr></thead><tbody>{data.customers.top.map((customer, index) => <tr key={`${customer.email}-${customer.phone}-${index}`} className="border-b border-black/5"><td className="p-2"><p className="font-bold">{customer.name}</p><p>{customer.email || "Email unavailable"}</p><p className="text-xs text-black/50">{customer.phone || "Phone unavailable"}</p></td><td className="p-2 capitalize">{customer.type}</td><td className="p-2">{customer.orders}</td><td className="p-2">{money(customer.orderValue)}</td><td className="p-2">{money(customer.completedOrderValue)}</td><td className="p-2">{dateLabel(customer.lastOrderDate)}</td></tr>)}</tbody></table> : <Empty text="No identifiable customers in this period." />}</div> : <div className="mt-5 rounded-xl bg-[#FFF8EC] p-4 text-sm font-semibold text-[#321B29]/70"><Users className="mb-2 text-[#B9472E]" size={20} />Customer names, contact details and individual customer insights require the viewCustomers permission.</div>}</Panel></>}</section></main>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className="analytics-surface rounded-2xl border border-[#321B29]/10 bg-white p-5 text-[#321B29] sm:p-6"><h2 className="mb-5 font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">{title}</h2>{children}</section>; }
function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-xl bg-[#FFF8EC] p-4"><p className="text-xs font-bold text-black/55">{label}</p><p className="mt-1 text-2xl font-bold text-[#321B29]">{value}</p></div>; }
function Empty({ text }: { text: string }) { return <p className="py-5 text-sm font-semibold text-black/50">{text}</p>; }
function RequestSummary({ data, empty }: { data: Analytics["catering"]; empty: string }) { return data.total ? <div className="grid gap-3 sm:grid-cols-2">{Object.entries(data).map(([label, value]) => <div key={label} className="rounded-xl bg-[#FFF8EC] p-4"><p className="text-xs font-bold capitalize text-black/55">{label}</p><p className="mt-1 text-2xl font-bold text-[#321B29]">{value}</p></div>)}</div> : <Empty text={empty} />; }
