import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { ADMIN_PERMISSION_KEYS } from "@/lib/admin/permissions";
import { sendAdminInvitationEmail } from "@/lib/email/adminEmails";
import { requireOwner } from "@/lib/server/requireAdmin";

const loginUrl = `${(process.env.NEXT_PUBLIC_SITE_URL || "https://africanrestaurant.ee").replace(/\/$/, "")}/login`;

function cleanPermissions(value: unknown) {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return Object.fromEntries(ADMIN_PERMISSION_KEYS.map((key) => [key, input[key] === true]));
}

function getInvitationError(error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code || "")
    : "";
  const message = error instanceof Error ? error.message : "";

  if (message === "UNAUTHORIZED") {
    return { message: "Your admin session has expired. Sign in again.", status: 401 };
  }

  if (message === "FORBIDDEN") {
    return { message: "Only the owner account can invite administrators.", status: 403 };
  }

  if (code === "auth/invalid-email") {
    return { message: "The administrator email address is invalid.", status: 400 };
  }

  if (code === "auth/email-already-exists") {
    return { message: "An account with this email already exists.", status: 409 };
  }

  if (code === "auth/invalid-continue-uri" || code === "auth/unauthorized-continue-uri") {
    return { message: "The password-reset redirect domain is not authorized in Firebase.", status: 500 };
  }

  if (code === "PERMISSION_DENIED" || code === "5") {
    return { message: "Firebase rejected the server request. Check the Firebase Admin credentials and Firestore access.", status: 500 };
  }

  if (message.includes("RESEND_API_KEY") || message.toLowerCase().includes("resend")) {
    return { message: "The administrator was not invited because the email provider is not configured correctly.", status: 502 };
  }

  return { message: "Unable to create administrator. Check the Firebase and email-provider configuration.", status: 500 };
}

export async function GET(request: Request) {
  try {
    await requireOwner(request);
    const snapshot = await adminDb.collection("admins").get();
    return NextResponse.json(snapshot.docs.map((item) => ({ uid: item.id, ...item.data() })));
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireOwner(request);
    const body = await request.json() as { email?: unknown; name?: unknown; permissions?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!email || !email.includes("@") || !name) return NextResponse.json({ error: "Name and email are required." }, { status: 400 });

    let user;
    try {
      user = await adminAuth.getUserByEmail(email);
    } catch (error) {
      if ((error as { code?: string }).code !== "auth/user-not-found") throw error;
      user = await adminAuth.createUser({ email, displayName: name });
    }
    if (user.disabled) return NextResponse.json({ error: "This Firebase account is disabled." }, { status: 409 });

    const existing = await adminDb.collection("admins").doc(user.uid).get();
    if (existing.exists && existing.data()?.role === "owner") return NextResponse.json({ error: "The owner account cannot be changed here." }, { status: 409 });
    await adminDb.collection("admins").doc(user.uid).set({
      uid: user.uid,
      name,
      email,
      role: "admin",
      active: true,
      permissions: cleanPermissions(body.permissions),
      createdAt: existing.exists ? existing.data()?.createdAt ?? FieldValue.serverTimestamp() : FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    let passwordResetLink: string;
    try {
      passwordResetLink = await adminAuth.generatePasswordResetLink(email, { url: loginUrl, handleCodeInApp: false });
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code !== "auth/invalid-continue-uri" && code !== "auth/unauthorized-continue-uri") {
        throw error;
      }

      console.warn("Admin invitation continue URL is not authorized; using Firebase's default reset page.");
      passwordResetLink = await adminAuth.generatePasswordResetLink(email);
    }
    try {
      await sendAdminInvitationEmail({ name, email, passwordResetLink });
    } catch {
      return NextResponse.json({
        error: "Administrator created, but the invitation email could not be sent. Use the reset link shown below or check the email provider configuration.",
        uid: user.uid,
        passwordResetLink,
      }, { status: 502 });
    }

    return NextResponse.json({ uid: user.uid, passwordResetLink, emailSent: true });
  } catch (error) {
    console.error("Admin invitation error:", error);
    const result = getInvitationError(error);
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
}
