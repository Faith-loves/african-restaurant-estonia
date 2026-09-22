import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase/admin";
import { hasAdminPermission, type AdminRecord } from "@/lib/admin/permissions";
import { getAdminAuthorization } from "@/lib/server/requireAdmin";

type NotificationType = "order" | "catering" | "gift-box";

function canViewType(type: string, admin: AdminRecord | null) {
  if (type === "order") return hasAdminPermission(admin, "manageOrders");
  return hasAdminPermission(admin, "manageCatering");
}

function timestampValue(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const { decodedToken, admin } = await getAdminAuthorization(request);
    const snapshot = await adminDb.collection("adminNotifications").orderBy("createdAt", "desc").limit(50).get();
    const notifications = snapshot.docs.flatMap((document) => {
      const data = document.data();
      const type = data.type as string;
      if (!canViewType(type, admin)) return [];

      return [{
        id: document.id,
        type: type as NotificationType,
        resourceId: typeof data.resourceId === "string" ? data.resourceId : "",
        reference: typeof data.reference === "string" ? data.reference : "",
        requesterName: typeof data.requesterName === "string" ? data.requesterName : null,
        createdAt: timestampValue(data.createdAt),
        read: data.readBy && typeof data.readBy === "object" && (data.readBy as Record<string, unknown>)[decodedToken.uid] === true,
      }];
    });

    return NextResponse.json({ notifications, unreadCount: notifications.filter((notification) => !notification.read).length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    return NextResponse.json({ error: message === "FORBIDDEN" ? "Forbidden." : "Unauthorized." }, { status: message === "FORBIDDEN" ? 403 : 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { decodedToken, admin } = await getAdminAuthorization(request);
    const body = await request.json() as { id?: unknown };
    const id = typeof body.id === "string" ? body.id.trim() : "";
    if (!id || !/^(order|catering|gift-box)_[A-Za-z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: "Invalid notification." }, { status: 400 });
    }

    const notification = await adminDb.collection("adminNotifications").doc(id).get();
    if (!notification.exists || !canViewType(String(notification.data()?.type || ""), admin)) {
      return NextResponse.json({ error: "Notification not found." }, { status: 404 });
    }

    const data = notification.data() || {};
    const readBy = data.readBy && typeof data.readBy === "object" ? data.readBy as Record<string, boolean> : {};
    await notification.ref.update({ readBy: { ...readBy, [decodedToken.uid]: true }, updatedAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    return NextResponse.json({ error: message === "FORBIDDEN" ? "Forbidden." : "Unable to mark notification as read." }, { status: message === "FORBIDDEN" ? 403 : 401 });
  }
}
