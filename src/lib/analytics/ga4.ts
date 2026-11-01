import type { CartItem } from "@/types/cart";
import type { MenuItem } from "@/types/menu";

export type EcommerceItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_category?: string;
  item_variant?: string;
  item_list_id?: string;
  item_list_name?: string;
};

export type AnalyticsEventName =
  | "page_view"
  | "view_item_list"
  | "select_item"
  | "view_item"
  | "add_to_cart"
  | "remove_from_cart"
  | "view_cart"
  | "begin_checkout"
  | "purchase";

const ANALYTICS_CONSENT_STORAGE_KEY = "are-analytics-consent";
const PRODUCTION_HOSTNAMES = new Set(["africanrestaurant.ee", "www.africanrestaurant.ee"]);
const trackedPurchaseIds = new Set<string>();
const pendingAnalyticsEvents: Array<[AnalyticsEventName, Record<string, unknown>]> = [];
let googleAnalyticsReady = false;
const VALUE_EVENTS = new Set<AnalyticsEventName>([
  "add_to_cart",
  "remove_from_cart",
  "view_cart",
  "begin_checkout",
  "purchase",
]);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function isProductionAnalyticsEnvironment() {
  return process.env.NODE_ENV === "production" && typeof window !== "undefined" && PRODUCTION_HOSTNAMES.has(window.location.hostname);
}

function hasAnalyticsConsent() {
  try {
    return window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY) === "accepted";
  } catch {
    return false;
  }
}

export function isAnalyticsEnabled() {
  return Boolean(measurementId && isProductionAnalyticsEnvironment() && hasAnalyticsConsent());
}

export function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    // Google’s canonical gtag bootstrap intentionally queues the Arguments object.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };
  return window.gtag;
}

export function configureGoogleAnalytics() {
  if (!measurementId || !isAnalyticsEnabled() || googleAnalyticsReady) return;

  (window as unknown as Record<string, boolean>)[`ga-disable-${measurementId}`] = false;
  const gtag = ensureGtag();
  gtag("js", new Date());
  gtag("config", measurementId, { send_page_view: false });
  googleAnalyticsReady = true;

  for (const [name, parameters] of pendingAnalyticsEvents.splice(0)) {
    gtag("event", name, parameters);
  }
}

export function disableGoogleAnalytics() {
  if (!measurementId || typeof window === "undefined") return;
  googleAnalyticsReady = false;
  pendingAnalyticsEvents.length = 0;
  (window as unknown as Record<string, boolean>)[`ga-disable-${measurementId}`] = true;
}

export function trackAnalyticsEvent(name: AnalyticsEventName, parameters: Record<string, unknown> = {}) {
  try {
    if (!isAnalyticsEnabled()) return false;
    if (!googleAnalyticsReady) {
      pendingAnalyticsEvents.push([name, parameters]);
      return true;
    }
    ensureGtag()("event", name, parameters);
    return true;
  } catch {
    return false;
  }
}

export function cartItemToAnalyticsItem(item: Pick<CartItem, "menuItemId" | "name" | "size" | "addOns" | "quantity">): EcommerceItem {
  const addOnTotal = item.addOns.reduce((sum, addOn) => sum + addOn.price, 0);

  return {
    item_id: item.menuItemId,
    item_name: item.name,
    price: roundCurrency(item.size.price + addOnTotal),
    quantity: item.quantity,
    item_variant: item.size.label,
  };
}

export type ServerOrderItem = {
  menuItemId?: unknown;
  name?: unknown;
  size?: { label?: unknown };
  quantity?: unknown;
  unitTotal?: unknown;
};

export function serverOrderItemToAnalyticsItem(item: ServerOrderItem): EcommerceItem | null {
  if (
    typeof item.menuItemId !== "string" ||
    typeof item.name !== "string" ||
    typeof item.quantity !== "number" ||
    !Number.isFinite(item.quantity) ||
    item.quantity < 1 ||
    typeof item.unitTotal !== "number" ||
    !Number.isFinite(item.unitTotal) ||
    item.unitTotal <= 0
  ) {
    return null;
  }

  return {
    item_id: item.menuItemId,
    item_name: item.name,
    price: roundCurrency(item.unitTotal),
    quantity: item.quantity,
    item_variant: typeof item.size?.label === "string" ? item.size.label : undefined,
  };
}

export function menuItemToAnalyticsItem(item: MenuItem, price: number): EcommerceItem | null {
  if (!Number.isFinite(price) || price <= 0) return null;

  return {
    item_id: item.id,
    item_name: item.name,
    price: roundCurrency(price),
    quantity: 1,
    item_category: item.category,
  };
}

export function trackEcommerceEvent(
  name: Exclude<AnalyticsEventName, "page_view">,
  items: EcommerceItem[],
  value?: number,
  extraParameters: Record<string, unknown> = {}
) {
  if (items.length === 0) return false;

  const calculatedValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const parameters: Record<string, unknown> = {
    currency: "EUR",
    items,
    ...extraParameters,
  };

  if (value !== undefined || VALUE_EVENTS.has(name)) {
    parameters.value = roundCurrency(value ?? calculatedValue);
  }

  return trackAnalyticsEvent(name, parameters);
}

export function trackPurchaseOnce(transactionId: string, value: number, items: EcommerceItem[]) {
  if (!transactionId || trackedPurchaseIds.has(transactionId) || !Number.isFinite(value) || items.length === 0 || !isAnalyticsEnabled()) return false;

  const storageKey = `are-purchase-tracked:${transactionId}`;
  try {
    if (window.sessionStorage.getItem(storageKey) === "true") return false;
    window.sessionStorage.setItem(storageKey, "true");
  } catch {
    // The module-level guard below still prevents duplicate events in this page session.
  }

  trackedPurchaseIds.add(transactionId);
  return trackEcommerceEvent("purchase", items, value, { transaction_id: transactionId });
}
