import { NextResponse } from "next/server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { isActiveAdminRecord } from "@/lib/admin/permissions";
import { getGuestTokenFromRequest, hashGuestToken } from "@/lib/server/guestSession";

function dateValue(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  return typeof value === "string" ? value : null;
}

function statusSortValue(value: unknown) {
  const date = dateValue(value);
  return date ? new Date(date).getTime() : 0;
}

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");

  try {
    let snapshot;
    let guest = false;

    if (authorization?.startsWith("Bearer ")) {
      const decodedToken = await adminAuth.verifyIdToken(authorization.slice("Bearer ".length));
      const adminSnapshot = await adminDb.collection("admins").doc(decodedToken.uid).get();

      if (isActiveAdminRecord(adminSnapshot.exists ? adminSnapshot.data() : null)) {
        return NextResponse.json({ admin: true, orders: [] });
      }

      snapshot = await adminDb.collection("orders").where("customerUid", "==", decodedToken.uid).get();
    } else {
      const guestToken = getGuestTokenFromRequest(request);
      if (!guestToken) return NextResponse.json({ error: "Sign in or start a guest session." }, { status: 401 });
      const guestSessionId = hashGuestToken(guestToken);
      const session = await adminDb.collection("guestSessions").doc(guestSessionId).get();
      if (!session.exists) return NextResponse.json({ error: "Your guest session is no longer available." }, { status: 401 });
      guest = true;
      snapshot = await adminDb.collection("orders").where("guestSessionId", "==", guestSessionId).get();
    }

    const orders = snapshot.docs
      .filter((document) => !guest || document.data().customerType === "guest")
      .map((document) => {
        const data = document.data();
        const items = Array.isArray(data.items)
          ? data.items.map((item: Record<string, unknown>) => ({
              name: typeof item.name === "string" ? item.name : "Menu item",
              quantity: typeof item.quantity === "number" ? item.quantity : 1,
              size: item.size && typeof item.size === "object" && typeof (item.size as Record<string, unknown>).label === "string"
                ? (item.size as Record<string, unknown>).label
                : null,
              addOns: Array.isArray(item.addOns)
                ? item.addOns.map((addOn: Record<string, unknown>) => typeof addOn.name === "string" ? addOn.name : "").filter(Boolean)
                : [],
              lineTotal: typeof item.lineTotal === "number" ? item.lineTotal : null,
            }))
          : [];

        return {
          id: document.id,
          reference: typeof data.reference === "string" ? data.reference : document.id,
          status: typeof data.status === "string" ? data.status : "pending_confirmation",
          fulfilment: data.fulfilment === "delivery" ? "delivery" : "pickup",
          subtotal: typeof data.subtotal === "number" ? data.subtotal : 0,
          total: typeof data.total === "number" ? data.total : typeof data.subtotal === "number" ? data.subtotal : 0,
          currency: typeof data.currency === "string" ? data.currency : "EUR",
          createdAt: dateValue(data.createdAt),
          updatedAt: dateValue(data.updatedAt),
          items,
        };
      })
      .sort((left, right) => statusSortValue(right.createdAt) - statusSortValue(left.createdAt));

    return NextResponse.json({ admin: false, guest, orders });
  } catch (error) {
    console.error("Customer order history error:", error);
    return NextResponse.json({ error: "Your order history could not be loaded." }, { status: 401 });
  }
}
