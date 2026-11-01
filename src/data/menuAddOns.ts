import type { MenuAddOn } from "@/types/menu";

export const restaurantDrinkAddOns = [
  { name: "Coca-Cola 0.50 L", price: 3 },
  { name: "Coca-Cola Zero 0.50 L", price: 3 },
  { name: "Fanta 0.50 L", price: 3 },
  { name: "Coca-Cola 0.30 L", price: 2.45 },
  { name: "Coca-Cola Zero 0.30 L", price: 2.45 },
  { name: "Fanta 0.30 L", price: 2.45 },
  { name: "Sprite 0.30 L", price: 2.45 },
  { name: "Water 0.50 L", price: 2.15 },
  { name: "Zobo 0.30 L", price: 3.99 },
  { name: "Ginger Drink 0.30 L", price: 3.99 },
] as const;

// Confirmed by the owner: protein extras use existing Small portion prices.
export const restaurantProteinAddOns = [
  { name: "Peppered Chicken (Small)", price: 6.5 },
  { name: "Peppered Turkey (Small)", price: 7.5 },
  { name: "Peppered Beef (Small)", price: 10.5 },
  { name: "Peppered Fish (Small)", price: 10.5 },
  { name: "Peppered Gizzard (Small)", price: 9.5 },
  { name: "Peppered Pomo (Small)", price: 8.5 },
] as const;

const legacyDrinkNames = new Set(["ginger drink", "zobo", "coca-cola can"]);

/** Used for catalogue creation and the one-time update of existing database rows. */
export function mergeRequestedMenuAddOns(id: string, category: string, existing: readonly MenuAddOn[] = []): MenuAddOn[] {
  if (category === "DRINKS") return [...existing];
  const merged = new Map<string, MenuAddOn>();
  for (const addOn of existing) {
    const key = addOn.name.trim().toLowerCase();
    if (legacyDrinkNames.has(key) || (key === "malt" && addOn.price === undefined)) continue;
    merged.set(key, { ...addOn });
  }
  const proteins = category === "SOUP" || id === "ofada-sauce" || id === "ayamase-sauce"
    ? restaurantProteinAddOns : [];
  for (const addOn of [...proteins, ...restaurantDrinkAddOns]) {
    merged.set(addOn.name.toLowerCase(), { ...addOn });
  }
  return [...merged.values()];
}
