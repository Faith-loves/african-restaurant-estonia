import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdminPermission } from "@/lib/server/requireAdmin";

const COMPLETED_ORDER_STATUS = "completed";
const ORDER_STATUSES = ["pending_confirmation", "confirmed", "preparing", "ready", "completed", "cancelled"];

type DateRange = { from: number | null; to: number | null };
type FirestoreRecord = Record<string, unknown> & { id: string };

function timestampMillis(value: unknown) {
  if (value && typeof value === "object") {
    const timestamp = value as { toMillis?: () => number; toDate?: () => Date; seconds?: number; _seconds?: number };
    if (typeof timestamp.toMillis === "function") return timestamp.toMillis();
    if (typeof timestamp.toDate === "function") return timestamp.toDate().getTime();
    const seconds = timestamp.seconds ?? timestamp._seconds;
    if (typeof seconds === "number") return seconds * 1000;
  }
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function dateRange(searchParams: URLSearchParams): DateRange {
  const range = searchParams.get("range") ?? "all";
  const now = new Date();
  if (range === "7d") return { from: now.getTime() - 7 * 24 * 60 * 60 * 1000, to: null };
  if (range === "30d") return { from: now.getTime() - 30 * 24 * 60 * 60 * 1000, to: null };
  if (range === "month") return { from: Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1), to: null };
  if (range === "custom") {
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const from = start ? Date.parse(`${start}T00:00:00.000Z`) : null;
    const to = end ? Date.parse(`${end}T23:59:59.999Z`) : null;
    return { from: from && !Number.isNaN(from) ? from : null, to: to && !Number.isNaN(to) ? to : null };
  }
  return { from: null, to: null };
}

function inRange(value: unknown, range: DateRange) {
  const millis = timestampMillis(value);
  if (!millis) return range.from === null && range.to === null;
  return (range.from === null || millis >= range.from) && (range.to === null || millis <= range.to);
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalized(value: unknown) {
  return text(value).toLowerCase().replace(/[^a-z0-9+@.]/g, "");
}

function numeric(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : Number(value) || 0;
}

function statusCounts(rows: Record<string, unknown>[], statuses: string[]) {
  return Object.fromEntries(statuses.map((status) => [status, rows.filter((row) => row.status === status).length]));
}

export async function GET(request: Request) {
  try {
    const authorization = await requireAdminPermission(request, "viewAnalytics");
    const admin = authorization.admin;
    if (!admin) throw new Error("FORBIDDEN");
    const canViewCustomers = admin.permissions === undefined || admin.role === "owner" || admin.permissions?.viewCustomers === true;
    const range = dateRange(new URL(request.url).searchParams);
    const [ordersSnapshot, requestsSnapshot] = await Promise.all([
      adminDb.collection("orders").get(),
      adminDb.collection("cateringRequests").get(),
    ]);
    const orders = (ordersSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })) as FirestoreRecord[]).filter((order) => inRange(order.createdAt, range));
    const requests = (requestsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })) as FirestoreRecord[]).filter((item) => inRange(item.createdAt, range));
    const completedOrders = orders.filter((order) => order.status === COMPLETED_ORDER_STATUS);
    const orderValue = orders.reduce((sum, order) => sum + numeric(order.total), 0);
    const completedOrderValue = completedOrders.reduce((sum, order) => sum + numeric(order.total), 0);
    const foodMap = new Map<string, { name: string; quantity: number; orders: number; orderValue: number }>();
    const customerMap = new Map<string, { name: string; email: string; phone: string; type: "registered" | "guest"; orders: number; orderValue: number; completedOrderValue: number; lastOrderDate: number }>();

    for (const order of orders) {
      const items = Array.isArray(order.items) ? order.items as Record<string, unknown>[] : [];
      const seenFood = new Set<string>();
      for (const item of items) {
        const name = text(item.name) || "Unnamed item";
        const key = name.toLowerCase();
        const current = foodMap.get(key) ?? { name, quantity: 0, orders: 0, orderValue: 0 };
        current.quantity += numeric(item.quantity);
        current.orderValue += numeric(item.lineTotal);
        if (!seenFood.has(key)) { current.orders += 1; seenFood.add(key); }
        foodMap.set(key, current);
      }

      const customer = order.customer && typeof order.customer === "object" ? order.customer as Record<string, unknown> : {};
      const customerUid = text(order.customerUid);
      const email = normalized(customer.email);
      const phone = normalized(customer.phone);
      const customerType = order.customerType === "registered" && customerUid ? "registered" : "guest";
      if (customerType === "guest" && !email && !phone) continue;
      const identity = customerType === "registered" ? `registered:${customerUid}` : email ? `guest:email:${email}` : phone ? `guest:phone:${phone}` : `guest:order:${order.id}`;
      const current = customerMap.get(identity) ?? { name: text(customer.name) || "Customer", email: text(customer.email), phone: text(customer.phone), type: customerType, orders: 0, orderValue: 0, completedOrderValue: 0, lastOrderDate: 0 };
      current.orders += 1;
      current.orderValue += numeric(order.total);
      if (order.status === COMPLETED_ORDER_STATUS) current.completedOrderValue += numeric(order.total);
      current.lastOrderDate = Math.max(current.lastOrderDate, timestampMillis(order.createdAt));
      if (!current.email) current.email = text(customer.email);
      if (!current.phone) current.phone = text(customer.phone);
      if (current.name === "Customer") current.name = text(customer.name) || current.name;
      customerMap.set(identity, current);
    }

    const customers = [...customerMap.values()];
    const customerDetails = canViewCustomers ? customers.sort((a, b) => b.orders - a.orders || b.orderValue - a.orderValue).slice(0, 20).map((customer) => ({ ...customer, lastOrderDate: customer.lastOrderDate ? new Date(customer.lastOrderDate).toISOString() : null })) : [];
    const registeredCustomers = customers.filter((customer) => customer.type === "registered").length;
    const guestCustomers = customers.filter((customer) => customer.type === "guest").length;
    const cateringRequests = requests.filter((item) => item.serviceType !== "gift-box");
    const giftBoxRequests = requests.filter((item) => item.serviceType === "gift-box");
    const metric = (rows: Record<string, unknown>[]) => ({ total: rows.length, pending: rows.filter((row) => row.status === "pending_confirmation").length, confirmed: rows.filter((row) => row.status === "confirmed").length, completed: rows.filter((row) => row.status === "completed").length, declined: rows.filter((row) => row.status === "declined").length });

    return NextResponse.json({
      canViewCustomers,
      summary: { totalOrders: orders.length, completedOrders: completedOrders.length, activeOrders: orders.filter((order) => !["completed", "cancelled"].includes(text(order.status))).length, cancelledOrders: orders.filter((order) => order.status === "cancelled").length, orderValue, completedOrderValue, averageOrderValue: orders.length ? orderValue / orders.length : 0, totalCateringRequests: cateringRequests.length, totalGiftBoxRequests: giftBoxRequests.length },
      orderStatuses: statusCounts(orders, ORDER_STATUSES),
      foodPopularity: [...foodMap.values()].sort((a, b) => b.quantity - a.quantity || b.orderValue - a.orderValue).slice(0, 10),
      customers: { totalIdentifiable: customers.length, registered: registeredCustomers, guests: guestCustomers, repeat: customers.filter((customer) => customer.orders > 1).length, oneTime: customers.filter((customer) => customer.orders === 1).length, top: customerDetails },
      catering: metric(cateringRequests),
      giftBox: metric(giftBoxRequests),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    return NextResponse.json({ error: message === "FORBIDDEN" ? "Forbidden." : "Unauthorized." }, { status: message === "FORBIDDEN" ? 403 : 401 });
  }
}
