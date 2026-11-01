import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase/admin";
import { requireAdminPermission } from "@/lib/server/requireAdmin";

const ORDER_STATUSES = new Set(["pending_confirmation", "confirmed", "preparing", "ready", "completed", "cancelled"]);

export async function POST(request: Request) {
  try {
    await requireAdminPermission(request, "manageOrders");
    const body = await request.json() as { orderId?: unknown; status?: unknown };
    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    const status = typeof body.status === "string" ? body.status : "";
    if (!orderId || !ORDER_STATUSES.has(status)) return NextResponse.json({ error: "Invalid order status update." }, { status: 400 });

    const orderReference = adminDb.collection("orders").doc(orderId);
    const snapshot = await orderReference.get();
    if (!snapshot.exists) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (snapshot.data()?.status === "completed" && status !== "completed") return NextResponse.json({ error: "Completed orders are final and cannot be changed." }, { status: 409 });

    await orderReference.update({ status, updatedAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ success: true, status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    return NextResponse.json({ error: message === "FORBIDDEN" ? "Forbidden." : "The order status could not be updated." }, { status: message === "FORBIDDEN" ? 403 : 401 });
  }
}
