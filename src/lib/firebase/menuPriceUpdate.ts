import { collection, doc, getDocs, serverTimestamp, writeBatch } from "firebase/firestore";
import { menuItems, isHiddenMenuCategory, legacyDuplicateComboIds } from "@/data/menuData";
import { buildRequestedMenuPatch } from "@/data/menuPriceUpdate";
import { db } from "@/lib/firebase/client";

/** Apply the owner's update once, without a destructive catalogue re-import. */
export async function applyRequestedMenuUpdates() {
  const snapshot = await getDocs(collection(db, "menuItems"));
  const catalogue = new Map(menuItems.map(item => [item.id, item]));
  const existing = new Map(snapshot.docs.map(document => [document.id, document.data()]));
  const ids = new Set([...catalogue.keys(), ...existing.keys()]);
  const patches = new Map([...ids].map(id => [id, buildRequestedMenuPatch(id, catalogue.get(id), existing.get(id))]));
  // Match every vegan portion to its normal rice counterpart, including an
  // existing Small price that the owner did not ask to change.
  for (const [vegan, normal] of [["vegan-jollof-rice", "jollof-rice"], ["vegan-fried-rice", "fried-rice"]]) {
    const patch = patches.get(vegan);
    if (patch) {
      patch.sizes = patches.get(normal)?.sizes ?? existing.get(normal)?.sizes ?? catalogue.get(normal)?.sizes;
      patch.pricePending = patches.get(normal)?.pricePending ?? existing.get(normal)?.pricePending ?? false;
    }
  }
  const batches = [];
  let batch = writeBatch(db);
  let count = 0;
  let batchCount = 0;
  for (const id of ids) {
    const item = catalogue.get(id);
    const record = existing.get(id);
    if (isHiddenMenuCategory(record?.category ?? item?.category) || (legacyDuplicateComboIds as readonly string[]).includes(id)) continue;
    const patch = patches.get(id);
    if (!patch) continue;
    const payload = record ? patch : {
      ...item,
      isTodayMenu: item?.isTodayMenu ?? false,
      isChefSpecial: item?.isChefSpecial ?? false,
      ...patch,
      createdAt: serverTimestamp(),
    };
    batch.set(doc(db, "menuItems", id), { ...payload, updatedAt: serverTimestamp() }, { merge: true });
    count++;
    batchCount++;
    if (batchCount === 450) {
      batches.push(batch);
      batch = writeBatch(db);
      batchCount = 0;
    }
  }
  if (batchCount) batches.push(batch);
  for (const pendingBatch of batches) await pendingBatch.commit();
  return count;
}
