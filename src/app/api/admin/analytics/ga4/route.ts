import { NextResponse } from "next/server";

import { requireAdminPermission } from "@/lib/server/requireAdmin";
import { Ga4ReportingError, getGa4ReportingData, hasGa4ReportingConfiguration, type Ga4DateRange } from "@/lib/server/ga4Reporting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_RANGE_DAYS = 90;
const RANGE_VALUES = new Set(["today", "yesterday", "7d", "30d", "90d", "custom"]);

function dateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || dateString(date) !== value ? null : date;
}

function dateRange(request: Request): Ga4DateRange | null {
  const params = new URL(request.url).searchParams;
  const range = params.get("range") ?? "30d";
  if (!RANGE_VALUES.has(range)) return null;

  const today = new Date();
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  if (range === "custom") {
    const start = parseDate(params.get("start"));
    const customEnd = parseDate(params.get("end"));
    if (!start || !customEnd || customEnd < start || customEnd > end) return null;
    const dayCount = Math.floor((customEnd.getTime() - start.getTime()) / 86_400_000) + 1;
    return dayCount <= MAX_RANGE_DAYS ? { startDate: dateString(start), endDate: dateString(customEnd) } : null;
  }

  const days = range === "today" || range === "yesterday" ? 1 : Number.parseInt(range, 10);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (range === "yesterday" ? 1 : days - 1));
  if (range === "yesterday") end.setUTCDate(end.getUTCDate() - 1);
  return { startDate: dateString(start), endDate: dateString(end) };
}

function responseHeaders() {
  return { "Cache-Control": "private, max-age=60" };
}

export async function GET(request: Request) {
  try {
    await requireAdminPermission(request, "viewAnalytics");

    if (!hasGa4ReportingConfiguration()) {
      return NextResponse.json({ status: "not_configured" }, { headers: responseHeaders() });
    }

    const range = dateRange(request);
    if (!range) return NextResponse.json({ error: "Invalid or unsupported date range." }, { status: 400, headers: responseHeaders() });

    const data = await getGa4ReportingData(range);
    if (!data) return NextResponse.json({ status: "not_configured" }, { headers: responseHeaders() });
    return NextResponse.json({ status: "ok", data }, { headers: responseHeaders() });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403, headers: responseHeaders() });
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: responseHeaders() });
    }
    if (error instanceof Ga4ReportingError) {
      if (error.status === 429) return NextResponse.json({ error: "GA4 reporting is temporarily rate limited." }, { status: 429, headers: responseHeaders() });
      if (error.status === 401 || error.status === 403) return NextResponse.json({ error: "GA4 reporting authorization failed." }, { status: 502, headers: responseHeaders() });
      return NextResponse.json({ error: "GA4 reporting is temporarily unavailable." }, { status: 502, headers: responseHeaders() });
    }
    return NextResponse.json({ error: "GA4 reporting is temporarily unavailable." }, { status: 502, headers: responseHeaders() });
  }
}
