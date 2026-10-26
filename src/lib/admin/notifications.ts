import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase/admin";

export type AdminNotificationType = "order" | "catering" | "gift-box";

export async function createAdminNotification(input: {
  type: AdminNotificationType;
  resourceId: string;
  reference: string;
  requesterName?: string;
}) {
  const notificationId = `${input.type}_${input.resourceId}`;

  try {
    await adminDb.collection("adminNotifications").doc(notificationId).create({
      type: input.type,
      resourceId: input.resourceId,
      reference: input.reference,
      requesterName: input.requesterName || null,
      createdAt: FieldValue.serverTimestamp(),
      readBy: {},
    });
  } catch (error) {
    if ((error as { code?: number }).code !== 6) {
      console.error("Admin notification creation error:", error);
    }
  }
}
