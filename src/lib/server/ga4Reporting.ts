import { GoogleAuth } from "google-auth-library";

const GA4_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const GA4_API_BASE = "https://analyticsdata.googleapis.com/v1beta";
const CACHE_TTL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 12_000;

type DataApiMetric = { name: string };
type DataApiDimension = { name: string };
type DataApiDateRange = { startDate: string; endDate: string };
type DataApiFilter = {
  dimensionFilter?: {
    filter: {
      fieldName: string;
      inListFilter: { values: string[] };
    };
  };
};

type DataApiReportRequest = DataApiFilter & {
  dateRanges: DataApiDateRange[];
  dimensions?: DataApiDimension[];
  metrics: DataApiMetric[];
  limit?: string;
  orderBys?: Array<{
    metric?: { metricName: string };
    dimension?: { dimensionName: string };
    desc?: boolean;
  }>;
};

type DataApiValue = { value?: string };
type DataApiRow = {
  dimensionValues?: DataApiValue[];
  metricValues?: DataApiValue[];
};
type DataApiReport = {
  dimensionHeaders?: Array<{ name?: string }>;
  metricHeaders?: Array<{ name?: string }>;
  rows?: DataApiRow[];
  totals?: DataApiRow[];
};

type Ga4Credentials = {
  propertyId: string;
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

export type Ga4DateRange = {
  startDate: string;
  endDate: string;
};

export type Ga4Overview = {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  sessions: number;
  screenPageViews: number;
  engagementRate: number;
  averageEngagementTime: number;
  purchaseRevenue: number;
};

export type Ga4TrendPoint = {
  date: string;
  totalUsers: number;
  activeUsers: number;
  sessions: number;
  screenPageViews: number;
};

export type Ga4BreakdownRow = {
  name: string;
  totalUsers: number;
  sessions: number;
  screenPageViews?: number;
  engagementRate?: number;
};

export type Ga4EventRow = {
  eventName: string;
  eventCount: number;
  totalUsers: number;
  sessions: number;
};

export type Ga4ProductRow = {
  itemName: string;
  itemViews: number;
  addToCarts: number;
  itemsPurchased: number;
  itemRevenue: number;
};

export type Ga4ReportingData = {
  range: Ga4DateRange;
  overview: Ga4Overview;
  trends: Ga4TrendPoint[];
  pages: Ga4BreakdownRow[];
  channels: Ga4BreakdownRow[];
  sourceMedium: Ga4BreakdownRow[];
  devices: Ga4BreakdownRow[];
  countries: Ga4BreakdownRow[];
  ecommerceEvents: Ga4EventRow[];
  products: Ga4ProductRow[];
};

export class Ga4ReportingError extends Error {
  readonly status: number;

  constructor(status: number) {
    super("GA4_REPORTING_REQUEST_FAILED");
    this.name = "Ga4ReportingError";
    this.status = status;
  }
}

const responseCache = new Map<string, { expiresAt: number; data: Ga4ReportingData }>();
const inFlight = new Map<string, Promise<Ga4ReportingData>>();

function readCredentials(): Ga4Credentials | null {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim() ?? "";
  const projectId = process.env.GA4_PROJECT_ID?.trim() ?? "";
  const clientEmail = process.env.GA4_CLIENT_EMAIL?.trim() ?? "";
  const privateKey = process.env.GA4_PRIVATE_KEY?.trim().replace(/^['"]|['"]$/g, "").replace(/\\n/g, "\n") ?? "";

  if (!/^\d+$/.test(propertyId) || !projectId || !clientEmail || !privateKey.includes("BEGIN PRIVATE KEY")) {
    return null;
  }

  return { propertyId, projectId, clientEmail, privateKey };
}

export function hasGa4ReportingConfiguration() {
  return readCredentials() !== null;
}

function numeric(value: DataApiValue | undefined) {
  const parsed = Number(value?.value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function rowDimension(row: DataApiRow | undefined, index = 0) {
  return row?.dimensionValues?.[index]?.value ?? "";
}

function rowMetric(row: DataApiRow | undefined, index = 0) {
  return numeric(row?.metricValues?.[index]);
}

function rows(report: DataApiReport | undefined) {
  return report?.rows ?? [];
}

function totals(report: DataApiReport | undefined) {
  return report?.totals?.[0];
}

async function fetchReport(
  credentials: Ga4Credentials,
  accessToken: string,
  request: DataApiReportRequest
) {
  const response = await fetch(`${GA4_API_BASE}/properties/${credentials.propertyId}:runReport`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) throw new Ga4ReportingError(response.status);
  return response.json() as Promise<DataApiReport>;
}

function eventFilter() {
  return {
    dimensionFilter: {
      filter: {
        fieldName: "eventName",
        inListFilter: {
          values: ["view_item", "add_to_cart", "view_cart", "begin_checkout", "purchase"],
        },
      },
    },
  } satisfies DataApiFilter;
}

async function requestReportData(credentials: Ga4Credentials, range: Ga4DateRange): Promise<Ga4ReportingData> {
  const auth = new GoogleAuth({
    credentials: {
      project_id: credentials.projectId,
      client_email: credentials.clientEmail,
      private_key: credentials.privateKey,
    },
    scopes: [GA4_SCOPE],
  });
  const client = await auth.getClient();
  const accessTokenResult = await client.getAccessToken();
  const accessToken = typeof accessTokenResult === "string" ? accessTokenResult : accessTokenResult.token;
  if (!accessToken) throw new Ga4ReportingError(401);

  const dateRanges = [range];
  const [overviewReport, trendReport, pagesReport, channelsReport, sourceMediumReport, devicesReport, countriesReport, ecommerceEventsReport, productsReport] = await Promise.all([
    fetchReport(credentials, accessToken, {
      dateRanges,
      metrics: [
        { name: "totalUsers" },
        { name: "activeUsers" },
        { name: "newUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "engagementRate" },
        { name: "userEngagementDuration" },
        { name: "purchaseRevenue" },
      ],
    }),
    fetchReport(credentials, accessToken, {
      dateRanges,
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "totalUsers" },
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
    fetchReport(credentials, accessToken, {
      dateRanges,
      dimensions: [{ name: "pagePathPlusQueryString" }],
      metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }, { name: "sessions" }],
      limit: "25",
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    }),
    fetchReport(credentials, accessToken, {
      dateRanges,
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "totalUsers" }, { name: "sessions" }, { name: "engagementRate" }],
      limit: "20",
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    }),
    fetchReport(credentials, accessToken, {
      dateRanges,
      dimensions: [{ name: "sessionSourceMedium" }],
      metrics: [{ name: "totalUsers" }, { name: "sessions" }],
      limit: "25",
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    }),
    fetchReport(credentials, accessToken, {
      dateRanges,
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "totalUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
    }),
    fetchReport(credentials, accessToken, {
      dateRanges,
      dimensions: [{ name: "country" }],
      metrics: [{ name: "totalUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
      limit: "25",
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
    }),
    fetchReport(credentials, accessToken, {
      dateRanges,
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }, { name: "totalUsers" }, { name: "sessions" }],
      limit: "20",
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      ...eventFilter(),
    }),
    fetchReport(credentials, accessToken, {
      dateRanges,
      dimensions: [{ name: "itemName" }],
      metrics: [{ name: "itemViewEvents" }, { name: "itemsAddedToCart" }, { name: "itemsPurchased" }, { name: "itemRevenue" }],
      limit: "25",
      orderBys: [{ metric: { metricName: "itemViewEvents" }, desc: true }],
    }),
  ]);

  const overviewTotals = totals(overviewReport);
  const activeUsers = rowMetric(overviewTotals, 1);

  return {
    range,
    overview: {
      totalUsers: rowMetric(overviewTotals, 0),
      activeUsers,
      newUsers: rowMetric(overviewTotals, 2),
      sessions: rowMetric(overviewTotals, 3),
      screenPageViews: rowMetric(overviewTotals, 4),
      engagementRate: rowMetric(overviewTotals, 5),
      averageEngagementTime: activeUsers ? rowMetric(overviewTotals, 6) / activeUsers : 0,
      purchaseRevenue: rowMetric(overviewTotals, 7),
    },
    trends: rows(trendReport).map((row) => ({
      date: rowDimension(row),
      totalUsers: rowMetric(row, 0),
      activeUsers: rowMetric(row, 1),
      sessions: rowMetric(row, 2),
      screenPageViews: rowMetric(row, 3),
    })),
    pages: rows(pagesReport).map((row) => ({
      name: rowDimension(row),
      screenPageViews: rowMetric(row, 0),
      totalUsers: rowMetric(row, 1),
      sessions: rowMetric(row, 2),
    })),
    channels: rows(channelsReport).map((row) => ({
      name: rowDimension(row),
      totalUsers: rowMetric(row, 0),
      sessions: rowMetric(row, 1),
      engagementRate: rowMetric(row, 2),
    })),
    sourceMedium: rows(sourceMediumReport).map((row) => ({
      name: rowDimension(row),
      totalUsers: rowMetric(row, 0),
      sessions: rowMetric(row, 1),
    })),
    devices: rows(devicesReport).map((row) => ({
      name: rowDimension(row),
      totalUsers: rowMetric(row, 0),
      sessions: rowMetric(row, 1),
      screenPageViews: rowMetric(row, 2),
    })),
    countries: rows(countriesReport).map((row) => ({
      name: rowDimension(row),
      totalUsers: rowMetric(row, 0),
      sessions: rowMetric(row, 1),
      screenPageViews: rowMetric(row, 2),
    })),
    ecommerceEvents: rows(ecommerceEventsReport).map((row) => ({
      eventName: rowDimension(row),
      eventCount: rowMetric(row, 0),
      totalUsers: rowMetric(row, 1),
      sessions: rowMetric(row, 2),
    })),
    products: rows(productsReport).map((row) => ({
      itemName: rowDimension(row),
      itemViews: rowMetric(row, 0),
      addToCarts: rowMetric(row, 1),
      itemsPurchased: rowMetric(row, 2),
      itemRevenue: rowMetric(row, 3),
    })),
  };
}

export async function getGa4ReportingData(range: Ga4DateRange) {
  const credentials = readCredentials();
  if (!credentials) return null;

  const cacheKey = `${credentials.propertyId}:${range.startDate}:${range.endDate}`;
  const cached = responseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const existingRequest = inFlight.get(cacheKey);
  if (existingRequest) return existingRequest;

  const request = requestReportData(credentials, range)
    .then((data) => {
      responseCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, data });
      return data;
    })
    .finally(() => {
      inFlight.delete(cacheKey);
    });

  inFlight.set(cacheKey, request);
  return request;
}
