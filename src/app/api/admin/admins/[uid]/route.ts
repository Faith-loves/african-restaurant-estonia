import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { ADMIN_PERMISSION_KEYS } from "@/lib/admin/permissions";
import { requireOwner } from "@/lib/server/requireAdmin";

function cleanPermissions(value: unknown) {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return Object.fromEntries(ADMIN_PERMISSION_KEYS.map((key) => [key, input[key] === true]));
}

export async function PATCH(request: Request, context: { params: Promise<{ uid: string }> }) {
  try {
    const authorization = await requireOwner(request);
    const { uid } = await context.params;
    if (uid === authorization.decodedToken.uid) return NextResponse.json({ error: "The owner cannot deactivate their own account." }, { status: 400 });
    const existing = await adminDb.collection("admins").doc(uid).get();
    if (!existing.exists || existing.data()?.role === "owner") return NextResponse.json({ error: "Administrator not found." }, { status: 404 });
    const body = await request.json() as { name?: unknown; permissions?: unknown; active?: unknown };
    const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
    if (body.permissions !== undefined) updates.permissions = cleanPermissions(body.permissions);
    if (typeof body.active === "boolean") updates.active = body.active;
    await adminDb.collection("admins").doc(uid).update(updates);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to update administrator." }, { status: 400 });
  }
}
