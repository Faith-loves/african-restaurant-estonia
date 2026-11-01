"use client";

import { useCallback, useEffect, useState } from "react";
import { getIdToken, type User } from "firebase/auth";
import {
  Activity,
  BarChart3,
  CircleAlert,
  Globe2,
  MonitorSmartphone,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

import { useAdminAuth } from "@/context/AdminAuthContext";

type WebsiteRange = "7d" | "30d" | "90d";

type BreakdownRow = {
  name: string;
  totalUsers: number;
  sessions: number;
  screenPageViews?: number;
  engagementRate?: number;
};

type WebsiteAnalyticsData = {
  range: { startDate: string; endDate: string };
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    sessions: number;
    screenPageViews: number;
    engagementRate: number;
    averageEngagementTime: number;
    purchaseRevenue: number;
  };
  trends: Array<{
    date: string;
    totalUsers: number;
    activeUsers: number;
    sessions: number;
    screenPageViews: number;
  }>;
  pages: BreakdownRow[];
  channels: BreakdownRow[];
  sourceMedium: BreakdownRow[];
  devices: BreakdownRow[];
  countries: BreakdownRow[];
  ecommerceEvents: Array<{
    eventName: string;
    eventCount: number;
    totalUsers: number;
    sessions: number;
  }>;
  products: Array<{
    itemName: string;
    itemViews: number;
    addToCarts: number;
    itemsPurchased: number;
    itemRevenue: number;
  }>;
};

type ApiResponse =
  | { status: "ok"; data: WebsiteAnalyticsData }
  | { status: "not_configured" }
  | { error: string };

const eventLabels: Record<string, string> = {
  view_item: "Product views",
  add_to_cart: "Add to cart",
  view_cart: "Cart views",
  begin_checkout: "Checkout starts",
  purchase: "Purchases",
};

const numberFormat = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
const currencyFormat = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });

function number(value: number) {
  return numberFormat.format(value);
}

function percent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function currency(value: number) {
  return currencyFormat.format(value);
}

function duration(seconds: number) {
  if (seconds < 60) return `${Math.round(seconds)} sec`;
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
}

function shortDate(value: string) {
  const parsed = /^\d{8}$/.test(value)
    ? new Date(Date.UTC(Number(value.slice(0, 4)), Number(value.slice(4, 6)) - 1, Number(value.slice(6, 8))))
    : new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(parsed);
}

export default function WebsiteAnalytics() {
  const { user, loading: adminLoading } = useAdminAuth();
  const [range, setRange] = useState<WebsiteRange>("30d");
  const [data, setData] = useState<WebsiteAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (adminUser: User, signal: AbortSignal) => {
    setLoading(true);
    setError("");

    try {
      const token = await getIdToken(adminUser);
      const response = await fetch(`/api/admin/analytics/ga4?range=${range}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      const payload = await response.json() as ApiResponse;

      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Unable to load website analytics.");
      }

      if (!("status" in payload)) {
        throw new Error(payload.error || "Unable to load website analytics.");
      }

      if (payload.status === "not_configured") {
        setData(null);
        setError("GA4 reporting is not configured for this deployment yet.");
        return;
      }

      setData(payload.data);
    } catch (loadError) {
      if (loadError instanceof DOMException && loadError.name === "AbortError") return;
      setData(null);
      setError(loadError instanceof Error ? loadError.message : "Unable to load website analytics.");
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    if (adminLoading || !user) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => void load(user, controller.signal), 0);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [adminLoading, load, user]);

  const retry = () => {
    if (!user) return;
    const controller = new AbortController();
    void load(user, controller.signal);
  };

  return <section className="mt-6 space-y-6" aria-label="Website Analytics">
    <div className="flex flex-col gap-4 rounded-2xl border border-[#321B29]/10 bg-white p-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#B9472E]">Google Analytics 4</p>
        <p className="mt-1 text-sm font-semibold text-[#321B29]/60">Website behaviour is separate from Firestore order analytics.</p>
      </div>
      <label className="text-xs font-extrabold uppercase tracking-wide text-[#321B29]/65">Date range
        <select value={range} onChange={(event) => setRange(event.target.value as WebsiteRange)} className="mt-1 block min-h-11 rounded-lg border p-2 text-sm normal-case tracking-normal">
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </label>
    </div>

    {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={retry} /> : data ? <>
      <Overview data={data} />
      <TrendChart data={data.trends} />
      <div className="grid gap-6 xl:grid-cols-2">
        <BreakdownPanel title="Top visited pages" rows={data.pages} metric="screenPageViews" metricLabel="views" />
        <BreakdownPanel title="Traffic channels" rows={data.channels} metric="sessions" metricLabel="sessions" showEngagement />
        <BreakdownPanel title="Source / medium" rows={data.sourceMedium} metric="sessions" metricLabel="sessions" />
        <BreakdownPanel title="Visitor countries" rows={data.countries} metric="totalUsers" metricLabel="users" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <BreakdownPanel title="Device categories" rows={data.devices} metric="totalUsers" metricLabel="users" icon={<MonitorSmartphone size={20} />} />
        <EcommercePanel events={data.ecommerceEvents} products={data.products} />
      </div>
    </> : <EmptyState />}
  </section>;
}

function Overview({ data }: { data: WebsiteAnalyticsData }) {
  const cards = [
    ["Total users", number(data.overview.totalUsers), <Users key="users" size={19} />],
    ["Active users", number(data.overview.activeUsers), <Activity key="active" size={19} />],
    ["New users", number(data.overview.newUsers), <TrendingUp key="new" size={19} />],
    ["Sessions", number(data.overview.sessions), <Globe2 key="sessions" size={19} />],
    ["Page views", number(data.overview.screenPageViews), <BarChart3 key="views" size={19} />],
    ["Engagement rate", percent(data.overview.engagementRate), <Activity key="rate" size={19} />],
    ["Avg. engagement", duration(data.overview.averageEngagementTime), <TrendingUp key="time" size={19} />],
    ["GA4 purchase revenue", currency(data.overview.purchaseRevenue), <ShoppingCart key="revenue" size={19} />],
  ] as const;

  return <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Website overview">
    {cards.map(([label, value, icon]) => <div key={label} className="rounded-2xl border border-[#321B29]/10 bg-white p-5">
      <div className="flex items-center justify-between gap-3 text-[#B9472E]"><p className="text-xs font-extrabold uppercase tracking-wide">{label}</p>{icon}</div>
      <p className="mt-3 font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">{value}</p>
      <p className="mt-1 text-xs font-semibold text-[#321B29]/45">GA4 metric</p>
    </div>)}
  </section>;
}

function TrendChart({ data }: { data: WebsiteAnalyticsData["trends"] }) {
  const points = data.length ? data : [{ date: "", totalUsers: 0, activeUsers: 0, sessions: 0, screenPageViews: 0 }];
  const maximum = Math.max(...points.map((point) => point.sessions), 1);
  const coordinates = points.map((point, index) => {
    const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
    const y = 90 - (point.sessions / maximum) * 78;
    return `${x},${y}`;
  }).join(" ");

  return <Panel title="Daily website traffic" icon={<TrendingUp size={20} />}>
    {data.length ? <>
      <div className="overflow-x-auto pb-2">
        <svg viewBox="0 0 100 100" className="h-64 min-w-[620px] w-full overflow-visible" role="img" aria-label="Daily sessions trend">
          <line x1="0" y1="90" x2="100" y2="90" stroke="currentColor" className="text-[#321B29]/10" strokeWidth="0.5" />
          <polyline points={coordinates} fill="none" stroke="#B9472E" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          {points.map((point, index) => {
            const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
            const y = 90 - (point.sessions / maximum) * 78;
            return <circle key={point.date} cx={x} cy={y} r="1.8" fill="#D89A27"><title>{`${shortDate(point.date)}: ${number(point.sessions)} sessions`}</title></circle>;
          })}
        </svg>
      </div>
      <div className="mt-1 flex justify-between gap-2 text-xs font-semibold text-[#321B29]/50"><span>{shortDate(points[0].date)}</span><span>{shortDate(points[points.length - 1].date)}</span></div>
      <p className="mt-4 text-xs font-semibold text-[#321B29]/50">Sessions shown as the daily traffic line. Hover points for exact values.</p>
    </> : <EmptyState text="No daily traffic data is available for this period." />}
  </Panel>;
}

function BreakdownPanel({ title, rows, metric, metricLabel, showEngagement = false, icon }: { title: string; rows: BreakdownRow[]; metric: "totalUsers" | "sessions" | "screenPageViews"; metricLabel: string; showEngagement?: boolean; icon?: React.ReactNode }) {
  return <Panel title={title} icon={icon}><div className="space-y-3">{rows.length ? rows.map((row) => <div key={row.name} className="flex items-center justify-between gap-4 border-b border-[#321B29]/10 pb-3 text-sm last:border-0 last:pb-0"><div className="min-w-0"><p className="truncate font-bold" title={row.name}>{row.name || "(not set)"}</p><p className="mt-1 text-xs font-semibold text-[#321B29]/50">{number(row.totalUsers)} users{showEngagement && row.engagementRate !== undefined ? ` · ${percent(row.engagementRate)} engaged` : ""}</p></div><strong className="shrink-0 text-right text-[#B9472E]">{number(row[metric] ?? 0)}<span className="block text-[10px] font-bold uppercase tracking-wide text-[#321B29]/45">{metricLabel}</span></strong></div>) : <EmptyState text="No data is available for this period." />}</div></Panel>;
}

function EcommercePanel({ events, products }: { events: WebsiteAnalyticsData["ecommerceEvents"]; products: WebsiteAnalyticsData["products"] }) {
  const trackedEvents = ["view_item", "add_to_cart", "view_cart", "begin_checkout", "purchase"];
  return <Panel title="Restaurant ecommerce" icon={<ShoppingCart size={20} />}>
    <p className="mb-4 text-xs font-semibold leading-5 text-[#321B29]/55">Event totals are actions, not unique customers. GA4 revenue is shown separately from Firestore order value.</p>
    <div className="grid gap-3 sm:grid-cols-2">
      {trackedEvents.map((eventName) => {
        const event = events.find((item) => item.eventName === eventName);
        return <div key={eventName} className="rounded-xl bg-[#FFF8EC] p-4"><p className="text-xs font-bold text-[#321B29]/60">{eventLabels[eventName]}</p><p className="mt-1 text-2xl font-bold text-[#321B29]">{number(event?.eventCount ?? 0)}</p><p className="text-[11px] font-semibold text-[#321B29]/45">{number(event?.totalUsers ?? 0)} users · {number(event?.sessions ?? 0)} sessions</p></div>;
      })}
    </div>
    <div className="mt-5 rounded-xl border border-[#321B29]/10 p-4">
      <div className="flex items-center justify-between gap-3"><h3 className="font-bold text-[#321B29]">Popular products</h3><span className="text-xs font-bold text-[#B9472E]">GA4 items</span></div>
      {products.length ? <div className="mt-4 space-y-3">{products.map((product) => <div key={product.itemName} className="flex items-center justify-between gap-4 border-b border-[#321B29]/10 pb-3 text-sm last:border-0 last:pb-0"><div className="min-w-0"><p className="truncate font-bold" title={product.itemName}>{product.itemName || "(not set)"}</p><p className="text-xs font-semibold text-[#321B29]/50">{number(product.itemViews)} views · {number(product.addToCarts)} added</p></div><div className="shrink-0 text-right"><strong className="text-[#B9472E]">{number(product.itemsPurchased)}</strong><span className="block text-[10px] font-bold uppercase tracking-wide text-[#321B29]/45">purchased · {currency(product.itemRevenue)}</span></div></div>)}</div> : <EmptyState text="No product data is available for this period." />}
    </div>
  </Panel>;
}

function Panel({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) { return <section className="analytics-surface rounded-2xl border border-[#321B29]/10 bg-white p-5 text-[#321B29] sm:p-6"><h2 className="mb-5 flex items-center gap-2 font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">{icon ?? <BarChart3 size={20} className="text-[#B9472E]" />}{title}</h2>{children}</section>; }
function LoadingState() { return <div className="rounded-2xl border border-[#321B29]/10 bg-white py-16 text-center font-semibold text-[#321B29]/60">Loading website analytics…</div>; }
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) { return <div className="rounded-2xl border border-[#B9472E]/20 bg-[#B9472E]/10 p-6 text-[#B9472E]"><div className="flex items-start gap-3"><CircleAlert size={20} className="mt-0.5 shrink-0" /><div><p className="font-bold">Website analytics unavailable</p><p className="mt-1 text-sm font-semibold">{message}</p><button type="button" onClick={onRetry} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#321B29] px-4 py-2 text-sm font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29]"><RefreshCw size={16} />Retry</button></div></div></div>; }
function EmptyState({ text = "No website analytics data is available for this period." }: { text?: string }) { return <div className="rounded-xl bg-[#FFF8EC] p-5 text-center text-sm font-semibold text-[#321B29]/55">{text}</div>; }
