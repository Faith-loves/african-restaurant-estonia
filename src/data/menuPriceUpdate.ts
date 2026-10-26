import type { MenuAddOn, MenuItem, MenuSize } from "@/types/menu";
import { mergeRequestedMenuAddOns } from "@/data/menuAddOns";

export const MENU_UPDATE_REVISION = "owner-menu-prices-2026-10-26-v1";

export const requestedPriceLabels: Record<string, readonly string[]> = {
  "jollof-rice": [
    "Medium",
    "Large"
  ],
  "vegan-jollof-rice": [
    "Medium",
    "Large"
  ],
  "fried-rice": [
    "Medium",
    "Large"
  ],
  "vegan-fried-rice": [
    "Medium",
    "Large"
  ],
  "fried-plantain": [
    "Small",
    "Medium",
    "Large"
  ],
  "fried-yam": [
    "Medium",
    "Large"
  ],
  "roasted-plantains": [
    "Medium",
    "Large"
  ],
  "ewedu-soup": [
    "Regular"
  ],
  "combo-jollof-chicken-plantain-zobo-1": [
    "Regular"
  ],
  "combo-jollof-turkey-plantain-zobo-2": [
    "Regular"
  ],
  "combo-jollof-fish-plantain-zobo-3": [
    "Regular"
  ],
  "combo-fried-rice-chicken-plantain-zobo-4": [
    "Regular"
  ],
  "combo-fried-rice-turkey-plantain-zobo-5": [
    "Regular"
  ],
  "combo-fried-rice-fish-plantain-zobo-6": [
    "Regular"
  ],
  "combo-puffpuff-jollof-chicken-plantain-zobo-17": [
    "Regular"
  ],
  "combo-puffpuff-friedrice-chicken-plantain-zobo-18": [
    "Regular"
  ],
  "combo-egusi-beef-eba-zobo-19": [
    "Regular"
  ],
  "combo-egusi-beef-poundo-zobo-20": [
    "Regular"
  ],
  "combo-fried-yam-plantain-tomato-zobo-23": [
    "Regular"
  ],
  "ginger-juice": [
    "0.30 L"
  ],
  "coca-cola-can": [
    "0.30 L",
    "0.50 L"
  ]
};

export const requestedAvailableIds = new Set([
  "ewedu-soup",
  "combo-jollof-chicken-plantain-zobo-1",
  "combo-jollof-turkey-plantain-zobo-2",
  "combo-jollof-fish-plantain-zobo-3",
  "combo-fried-rice-chicken-plantain-zobo-4",
  "combo-fried-rice-turkey-plantain-zobo-5",
  "combo-fried-rice-fish-plantain-zobo-6",
  "combo-puffpuff-jollof-chicken-plantain-zobo-17",
  "combo-puffpuff-friedrice-chicken-plantain-zobo-18",
  "combo-egusi-beef-eba-zobo-19",
  "combo-egusi-beef-poundo-zobo-20",
  "combo-fried-yam-plantain-tomato-zobo-23",
  "ginger-juice",
  "coca-cola-can",
  "coca-cola-zero",
  "fanta",
  "sprite",
  "water",
  "zobo"
]);
const unavailableIds = new Set(["fish-pie", "chicken-pie"]);

/** Only these fields change; photos, descriptions, tags and later edits remain intact. */
export function buildRequestedMenuPatch(id: string, catalogueItem: MenuItem | undefined, existing: Record<string, unknown> = {}) {
  if (existing.menuUpdateRevision === MENU_UPDATE_REVISION) return null;
  const category = typeof existing.category === "string" ? existing.category : catalogueItem?.category ?? "MAIN DISH";
  const addOns = Array.isArray(existing.addOns) ? existing.addOns as MenuAddOn[] : catalogueItem?.addOns ?? [];
  const patch: Record<string, unknown> = {
    addOns: mergeRequestedMenuAddOns(id, category, addOns),
    menuUpdateRevision: MENU_UPDATE_REVISION,
  };
  const labels = requestedPriceLabels[id];
  if (labels && catalogueItem) {
    const requestedSizes = catalogueItem.sizes.filter(size => labels.includes(size.label));
    const replaceAllSizes = category === "DRINKS" || labels.includes("Regular");
    const currentSizes = Array.isArray(existing.sizes) ? existing.sizes as MenuSize[] : catalogueItem.sizes;
    const sizes = replaceAllSizes ? requestedSizes : [
      ...currentSizes.map(size => requestedSizes.find(requested => requested.label.toLowerCase() === size.label.toLowerCase()) ?? size),
      ...requestedSizes.filter(requested => !currentSizes.some(size => size.label.toLowerCase() === requested.label.toLowerCase())),
    ];
    patch.sizes = sizes;
    patch.pricePending = sizes.length === 0 || sizes.some(size => typeof size.price !== "number" || !Number.isFinite(size.price) || size.price <= 0);
  }
  if (requestedAvailableIds.has(id)) {
    patch.available = true;
    patch.isTodayMenu = true;
    patch.archived = false;
  } else if (unavailableIds.has(id)) {
    patch.available = false;
    patch.isTodayMenu = false;
  }
  if (id === "coca-cola-can") patch.name = "Coca-Cola";
  return patch;
}
